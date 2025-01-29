export default function AdminPage() {
    return (
        <RoleGuard allowedRoles={['admin']}>
            <div>Admin only content</div>
        </RoleGuard>
    )
} 