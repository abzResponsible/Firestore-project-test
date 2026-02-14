import React, { useState, useEffect, useMemo } from 'react'
import { collection, addDoc, serverTimestamp, getDocs, doc, deleteDoc, runTransaction, orderBy, query } from 'firebase/firestore'
import EditTodo from './EditTodo'
import { db } from '../services/firebase.config'

const Todo = () => {
  const [createTodo, setCreateTodo] = useState("")
  const [todos, setTodo] = useState([]);

  // Fix 1: Removed unused 'checked' state to clear 'no-unused-vars'
  // Fix 2: Wrapped collectionRef in useMemo to fix 'react-hooks/exhaustive-deps'
  const collectionRef = useMemo(() => collection(db, 'todo'), []);

  useEffect(() => {
    const getTodo = async () => {
      const q = query(collectionRef, orderBy('timestamp'))
      try {
        const todoSnap = await getDocs(q);
        const todoData = todoSnap.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        setTodo(todoData);
      } catch (err) {
        console.error(err);
      }
    }
    getTodo()
  }, [collectionRef]) // Dependency is now stable

  const submitTodo = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collectionRef, {
        todo: createTodo,
        isChecked: false,
        timestamp: serverTimestamp()
      })
      // Best practice: Instead of reload, fetch data again or update state
      window.location.reload(); 
    } catch (err) {
      console.error(err);
    }
  }

  const deleteTodo = async (id) => {
    try {
      if (window.confirm("Are you sure you want to delete this Task?")) {
        const documentRef = doc(db, "todo", id);
        await deleteDoc(documentRef);
        setTodo(todos.filter(item => item.id !== id)); // Local state update
      }
    } catch (err) {
      console.error(err);
    }
  }

  const checkHandler = async (event, todo) => {
    const todoId = event.target.name;
    
    // Update local state first for snappy UI
    setTodo(prev => prev.map(item => 
      item.id === todoId ? { ...item, isChecked: !item.isChecked } : item
    ));

    try {
      const docRef = doc(db, "todo", todoId);
      await runTransaction(db, async (transaction) => {
        const todoDoc = await transaction.get(docRef);
        if (!todoDoc.exists()) {
          // Fix 3: Throw an Error object instead of a string to fix 'no-throw-literal'
          throw new Error("Document does not exist!");
        }
        const newValue = !todoDoc.data().isChecked;
        transaction.update(docRef, { isChecked: newValue });
      });
    } catch (error) {
      console.error("Transaction failed: ", error);
    }
  };

  return (
    <>
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <div className="card card-white">
              <div className="card-body">
                <button
                  data-bs-toggle="modal"
                  data-bs-target="#addModal"
                  type="button"
                  className="btn btn-info">Add Todo
                </button>

                {todos.map(({ todo, id, isChecked, timestamp }) =>
                  <div className="todo-list" key={id}>
                    <div className="todo-item">
                      <hr />
                      <span className={`${isChecked === true ? 'done' : ''}`}>
                        <div className="checker">
                          <span>
                            <input
                              type="checkbox"
                              checked={isChecked} // Changed to controlled component
                              name={id}
                              onChange={(event) => checkHandler(event, todo)}
                            />
                          </span>
                        </div>
                        &nbsp;{todo}<br />
                        <i>{timestamp?.seconds ? new Date(timestamp.seconds * 1000).toLocaleString() : 'Loading...'}</i>
                      </span>
                      <span className=" float-end mx-3">
                        <EditTodo todo={todo} id={id} />
                      </span>
                      <button
                        type="button"
                        className="btn btn-danger float-end"
                        onClick={() => deleteTodo(id)}
                      >Delete</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="modal fade" id="addModal" tabIndex="-1" aria-labelledby="addModalLabel" aria-hidden="true">
        <div className="modal-dialog">
          <form className="d-flex" onSubmit={submitTodo}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="addModalLabel">Add Todo</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Add a Todo"
                  value={createTodo}
                  onChange={(e) => setCreateTodo(e.target.value)}
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                <button type="submit" className="btn btn-primary">Create Todo</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export default Todo;
