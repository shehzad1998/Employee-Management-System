namespace EmployeeManagmentAPI.DTOs
{
    public class LeaveMasterDTO
    {
        public int Id { get; set; }
        public string LeaveType { get; set; } = string.Empty;
        public int MaxDaysAllowed { get; set; }

    }
}
