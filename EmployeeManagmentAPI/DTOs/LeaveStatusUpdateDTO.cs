using EmployeeManagmentAPI.Enums;

namespace EmployeeManagmentAPI.DTOs
{
    public class LeaveStatusUpdateDTO
    {
        public int LeaveId { get; set; }
        public LeaveStatus Status { get; set; }
    }
}
