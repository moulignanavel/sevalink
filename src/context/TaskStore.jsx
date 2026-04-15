import { createContext, useContext, useState, useEffect } from 'react';
import { db, collection, query, orderBy, updateDoc, doc, serverTimestamp, arrayUnion, onSnapshot, getDoc } from '../firebase';
import { useAuth } from './AuthContext';
import { sendNotification } from '../utils/useNotifications';

const TaskStoreContext = createContext(null);

export function TaskStoreProvider({ children }) {
  const { user } = useAuth();
  const [tasks, setTasks]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [accepted, setAccepted]       = useState(new Set());
  const [submissions, setSubmissions] = useState([]);
  const [completed, setCompleted]     = useState(new Set());
  const [closed, setClosed]           = useState(new Set());

  // Real-time listener for tasks
  useEffect(() => {
    setLoading(true);
    let q;
    try {
      q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'));
    } catch {
      q = collection(db, 'tasks');
    }

    const unsub = onSnapshot(q,
      (snap) => {
        const firestoreTasks = snap.docs.map(d => {
          const data = d.data();
          return {
            id:             d.id,
            title:          data.title          || '',
            description:    data.description    || '',
            location:       data.location       || '',
            urgencyLevel:   data.urgency        || data.urgencyLevel || 'Low',
            requiredSkills: data.requiredSkills || [],
            status:         data.status         || 'Pending',
            volunteers:     data.volunteers     || 0,
            acceptedBy:     data.acceptedBy     || [],
            createdBy:      data.createdBy      || null,
            createdAt:      data.createdAt      || null,
          };
        });

        if (firestoreTasks.length > 0) {
          setTasks(firestoreTasks);
          // Restore accepted set for current user
          if (user?.uid) {
            const myAccepted = new Set(
              firestoreTasks
                .filter(t => Array.isArray(t.acceptedBy) && t.acceptedBy.includes(user.uid))
                .map(t => t.id)
            );
            setAccepted(myAccepted);
          }
        } else {
          // Firestore is empty — show empty state (no demo tasks)
          setTasks([]);
        }
        setLoading(false);
      },
      (err) => {
        console.error('[TaskStore] onSnapshot error:', err);
        // Fallback: try without orderBy
        onSnapshot(collection(db, 'tasks'), (snap) => {
          const firestoreTasks = snap.docs.map(d => {
            const data = d.data();
            return {
              id:             d.id,
              title:          data.title          || '',
              description:    data.description    || '',
              location:       data.location       || '',
              urgencyLevel:   data.urgency        || data.urgencyLevel || 'Low',
              requiredSkills: data.requiredSkills || [],
              status:         data.status         || 'Pending',
              volunteers:     data.volunteers     || 0,
              acceptedBy:     data.acceptedBy     || [],
              createdBy:      data.createdBy      || null,
              createdAt:      data.createdAt      || null,
            };
          });
          setTasks(firestoreTasks.length > 0 ? firestoreTasks : []);
          setLoading(false);
        });
      }
    );

    return () => unsub();
  }, [user?.uid]);

  // Volunteer accepts a task — prevents duplicate acceptance
  const acceptTask = async (id) => {
    if (!user?.uid) return;

    const task = tasks.find(t => t.id === id);
    if (!task) return;

    // Already accepted by this user
    if (accepted.has(id)) return;

    // Already accepted by someone else (single-volunteer tasks)
    // We allow multiple volunteers — just track who accepted
    // Optimistic UI update
    setAccepted(p => new Set([...p, id]));
    setTasks(p => p.map(t =>
      t.id === id
        ? { ...t, status: 'Accepted', volunteers: (t.volunteers || 0) + 1, acceptedBy: [...(t.acceptedBy || []), user.uid] }
        : t
    ));

    try {
      await updateDoc(doc(db, 'tasks', id), {
        status:     'Accepted',
        volunteers: (task.volunteers || 0) + 1,
        acceptedBy: arrayUnion(user.uid),
        acceptedAt: serverTimestamp(),
      });

      // Notify the NGO who created this task
      if (task.createdBy && task.createdBy !== user.uid) {
        // Get volunteer's name
        let volunteerName = 'A volunteer';
        try {
          const vSnap = await getDoc(doc(db, 'users', user.uid));
          if (vSnap.exists()) {
            volunteerName = vSnap.data().fullName || vSnap.data().name || 'A volunteer';
          }
        } catch {}

        await sendNotification({
          userId: task.createdBy,
          type:   'task_accepted',
          title:  `Your task has been accepted by a volunteer`,
          body:   `${volunteerName} accepted "${task.title}" · 📍 ${task.location}`,
        });
      }
    } catch (err) {
      console.error('[TaskStore] Error accepting task:', err);
      // Rollback on failure
      setAccepted(p => { const n = new Set(p); n.delete(id); return n; });
      setTasks(p => p.map(t => t.id === id ? task : t));
    }
  };

  // Volunteer submits proof
  const submitProof = ({ taskId, taskTitle, photo, comment, location }) => {
    setSubmissions(p => [
      ...p.filter(s => s.taskId !== taskId),
      {
        id:          Date.now(),
        taskId,
        taskTitle,
        photo,
        comment,
        location,
        submittedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        status:      'pending',
      },
    ]);
  };

  // NGO approves a submission
  const approveSubmission = async (submissionId) => {
    const sub = submissions.find(s => s.id === submissionId);
    if (!sub) return;
    setSubmissions(p => p.map(s => s.id === submissionId ? { ...s, status: 'approved' } : s));
    setCompleted(p => new Set([...p, sub.taskId]));
    setTasks(p => p.map(t => t.id === sub.taskId ? { ...t, status: 'Completed' } : t));
    try {
      await updateDoc(doc(db, 'tasks', sub.taskId), { status: 'Completed' });
    } catch (err) {
      console.error('[TaskStore] Error approving submission:', err);
    }
  };

  // NGO rejects a submission
  const rejectSubmission = (submissionId, reason = '') => {
    setSubmissions(p => p.map(s => s.id === submissionId ? { ...s, status: 'rejected', reason } : s));
  };

  // NGO closes a task
  const closeTask = async (id) => {
    setClosed(p => new Set([...p, id]));
    setTasks(p => p.map(t => t.id === id ? { ...t, status: 'Closed' } : t));
    try {
      await updateDoc(doc(db, 'tasks', id), { status: 'Closed' });
    } catch (err) {
      console.error('[TaskStore] Error closing task:', err);
    }
  };

  const pendingSubmissions = submissions.filter(s => s.status === 'pending');

  return (
    <TaskStoreContext.Provider value={{
      tasks, loading, accepted, submissions, completed, closed, pendingSubmissions,
      acceptTask, submitProof, approveSubmission, rejectSubmission, closeTask,
    }}>
      {children}
    </TaskStoreContext.Provider>
  );
}

export function useTaskStore() {
  const ctx = useContext(TaskStoreContext);
  if (!ctx) throw new Error('useTaskStore must be used inside TaskStoreProvider');
  return ctx;
}
