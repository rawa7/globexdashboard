import { supabase } from './supabase'

// 1. FETCHING ALL RECORDS
// PHP: $query = "SELECT * FROM users";
async function getAllUsers() {
    const { data, error } = await supabase
        .from('users')
        .select('*')
    
    if (error) {
        console.error('Error:', error.message)
        return null
    }
    return data
}

// 2. FETCHING WITH CONDITIONS
// PHP: $query = "SELECT * FROM users WHERE age > 18";
async function getAdultUsers() {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .gt('age', 18)
    
    return data
}

// 3. INSERTING DATA
// PHP: "INSERT INTO users (name, email) VALUES ('John', 'john@example.com')"
async function createUser(name: string, email: string) {
    const { data, error } = await supabase
        .from('users')
        .insert([
            { name: name, email: email }
        ])
        .select()
    
    return data
}

// 4. UPDATING DATA
// PHP: "UPDATE users SET name = 'John' WHERE id = 1"
async function updateUser(id: number, name: string) {
    const { data, error } = await supabase
        .from('users')
        .update({ name: name })
        .eq('id', id)
        .select()
    
    return data
}

// 5. DELETING DATA
// PHP: "DELETE FROM users WHERE id = 1"
async function deleteUser(id: number) {
    const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id)
    
    return error ? false : true
}

// 6. JOINING TABLES
// PHP: "SELECT users.*, posts.title FROM users JOIN posts ON users.id = posts.user_id"
async function getUsersWithPosts() {
    const { data, error } = await supabase
        .from('users')
        .select(`
            *,
            posts (
                title,
                content
            )
        `)
    
    return data
} 