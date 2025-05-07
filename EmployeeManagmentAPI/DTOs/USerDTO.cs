using EmployeeManagmentAPI.Models;

namespace EmployeeManagmentAPI.DTOs
{
    public class USerDTO
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public int RoleId { get; set; }
        public string RoleName { get; set; } = string.Empty;

    }
}
