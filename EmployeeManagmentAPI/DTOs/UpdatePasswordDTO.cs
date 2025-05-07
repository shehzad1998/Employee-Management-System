namespace EmployeeManagmentAPI.DTOs
{
    public class UpdatePasswordDTO
    {
        public int UserId { get; set; }
        public string OldPassword { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }
}
