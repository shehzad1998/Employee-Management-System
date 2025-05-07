using EmployeeManagmentAPI.Enums;

namespace EmployeeManagmentAPI.DTOs
{
    public class LeaveUpsertDTO
    {
        public int EmployeeId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int LeaveMasterId { get; set; }
        public LeaveStatus Status { get; set; } = LeaveStatus.Pending; // default
    }
}
