using EmployeeManagmentAPI.DTOs;
using EmployeeManagmentAPI.Models;
using EmployeeManagmentAPI.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Text;
using System.Security.Cryptography;


namespace EmployeeManagmentAPI.Repositories.Implementations
{
    public class UserRepository : IUserRepository
    {
        private readonly EmployeeManagementDBContext _context;

        public UserRepository(EmployeeManagementDBContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<User>> GetAllUsersAsync()
        {
            return await _context.Users.ToListAsync();
        }

        public async Task<User?> GetUserByIdAsync(int id)
        {
            return await _context.Users.FindAsync(id);
        }

        public async Task<User> AddUserAsync(User user)
        {
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return user;
        }

        public async Task<User?> UpdateUserAsync(User user)
        {
            var existing = await _context.Users.FindAsync(user.Id);
            if (existing == null) return null;

            existing.Username = user.Username;
            existing.PasswordHash = user.PasswordHash;
            existing.RoleId = user.RoleId;

            await _context.SaveChangesAsync();
            return existing;
        }
        public async Task<bool> UpdatePasswordAsync(UpdatePasswordDTO dto)
        {
            var user = await _context.Users.FindAsync(dto.UserId);
            if (user == null) return false;

            // Hash old password and compare
            var hashedOldPassword = HashPassword(dto.OldPassword);
            if (user.PasswordHash != hashedOldPassword)
                return false; // Old password does not match

            // Hash and update new password
            user.PasswordHash = HashPassword(dto.NewPassword);
            await _context.SaveChangesAsync();
            return true;
        }

        private string HashPassword(string password)
        {
            using var sha = SHA256.Create();
            var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(bytes);
        }


        public async Task<bool> DeleteUserAsync(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return false;

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return true;
        }

        // Add this method to check if the user is an admin
        public async Task<bool> IsUserAdminAsync(int employeeId)
        {
            // First get the employee with their associated user and role
            var employee = await _context.Employees
                .Include(e => e.User)          // Include the User navigation property
                .ThenInclude(u => u.Role)      // Then include the User's Role
                .FirstOrDefaultAsync(e => e.Id == employeeId);

            // Check if the chain of relationships exists
            return employee?.User?.Role?.Name == "Admin";
        }
    }
}
