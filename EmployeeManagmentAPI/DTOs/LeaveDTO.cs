using EmployeeManagmentAPI.Enums;

namespace EmployeeManagmentAPI.DTOs
{
    public class LeaveDTO
    {
        public int Id { get; set; }
        public int EmployeeId { get; set; }
        public string? EmployeeName { get; set; } = string.Empty;

        public int ManagerId { get; set; }
        public int LeaveMasterId { get; set; }
        public string? LeaveType { get; set; } = string.Empty;

        public DateOnly StartDate { get; set; }
        public DateOnly EndDate { get; set; }
        public LeaveStatus Status { get; set; }
        public string StatusText => Enum.GetName(typeof(LeaveStatus), Status) ?? "Unknown";

    }
}
