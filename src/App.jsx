import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState("");
  const [timeInput, setTimeInput] = useState("");

  // Request notification permission on app load
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  // Convert 24-hour HH:MM to AM/PM
  const formatToAMPM = (time24) => {
    if (!time24) {
      const now = new Date();
      return now.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
      });
    }
    const [hourStr, minute] = time24.split(":");
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour.toString().padStart(2, "0")}:${minute} ${ampm}`;
  };

  // Check for todo times and notify
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      todos.forEach((todo) => {
        const [timeStr, ampm] = todo.time.split(" ");
        let [hour, minute] = timeStr.split(":").map(Number);
        if (ampm === "PM" && hour !== 12) hour += 12;
        if (ampm === "AM" && hour === 12) hour = 0;
        if (hour === hours && minute === minutes) notifyTodo(todo.text);
      });
    }, 30000);
    return () => clearInterval(interval);
  }, [todos]);

  const notifyTodo = (message) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Todo Reminder!", { body: message });
      if (navigator.vibrate) navigator.vibrate(500);
    }
  };

  const addTodo = () => {
    const trimmedText = text.trim();
    if (!trimmedText) return;

    const todoTime = formatToAMPM(timeInput);
    setTodos([...todos, { text: trimmedText, time: todoTime, completed: false }]);
    setText("");
    setTimeInput("");
    notifyTodo(`Added: ${trimmedText} at ${todoTime}`);
  };

  const toggleCompleted = (index) => {
    const newTodos = [...todos];
    newTodos[index].completed = !newTodos[index].completed;
    setTodos(newTodos);
  };

  const deleteTodo = (index) => {
    setTodos(todos.filter((_, i) => i !== index));
  };

  const handlePressStart = (e) => e.currentTarget.classList.add("red");
  const handlePressEnd = (e) => e.currentTarget.classList.remove("red");

  return (
    <div className="container">
      <h1>Todo List</h1>

      <div className="input-section">
        <input
          type="text"
          placeholder="Enter a todo item"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <input
          type="time"
          value={timeInput}
          onChange={(e) => setTimeInput(e.target.value)}
        />
        <button onClick={addTodo}>Add</button>
      </div>

      <ul className="todo-list">
        {todos.map((todo, index) => (
          <li key={index} className={todo.completed ? "completed" : ""}>
            <span onClick={() => toggleCompleted(index)}>
              {todo.text} <small className="todo-time">({todo.time})</small>
            </span>
            <button
              className="delete-btn"
              onMouseDown={handlePressStart}
              onMouseUp={handlePressEnd}
              onMouseLeave={handlePressEnd}
              onTouchStart={handlePressStart}
              onTouchEnd={handlePressEnd}
              onClick={() => deleteTodo(index)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
