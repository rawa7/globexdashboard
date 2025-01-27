'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Todo {
  id: number
  title: string
  completed: boolean
}

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState('')

  // Fetch todos
  const fetchTodos = async () => {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('id', { ascending: true })
    
    if (error) {
      console.error('Error fetching todos:', error)
      return
    }
    
    setTodos(data || [])
  }

  // Add todo
  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTodo.trim()) return

    const { error } = await supabase
      .from('todos')
      .insert([{ title: newTodo, completed: false }])

    if (error) {
      console.error('Error adding todo:', error)
      return
    }

    setNewTodo('')
    fetchTodos()
  }

  // Update todo
  const toggleTodo = async (id: number, completed: boolean) => {
    const { error } = await supabase
      .from('todos')
      .update({ completed: !completed })
      .eq('id', id)

    if (error) {
      console.error('Error updating todo:', error)
      return
    }

    fetchTodos()
  }

  // Delete todo
  const deleteTodo = async (id: number) => {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting todo:', error)
      return
    }

    fetchTodos()
  }

  useEffect(() => {
    fetchTodos()
  }, [])

  return (
    <div className="max-w-md mx-auto p-4">
      <form onSubmit={addTodo} className="mb-4">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add new todo..."
          className="w-full p-2 border rounded"
        />
        <button 
          type="submit"
          className="mt-2 w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Add Todo
        </button>
      </form>

      <ul className="space-y-2">
        {todos.map((todo) => (
          <li 
            key={todo.id}
            className="flex items-center justify-between p-2 border rounded"
          >
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id, todo.completed)}
              />
              <span className={todo.completed ? 'line-through' : ''}>
                {todo.title}
              </span>
            </div>
            <button
              onClick={() => deleteTodo(todo.id)}
              className="text-red-500 hover:text-red-700"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
} 