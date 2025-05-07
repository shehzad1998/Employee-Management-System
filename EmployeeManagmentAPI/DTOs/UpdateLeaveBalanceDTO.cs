namespace EmployeeManagmentAPI.DTOs
{
    public class UpdateLeaveBalanceDTO
    {
        public int EmployeeId { get; set; }

        public int LeaveMasterId { get; set; }
        public int NewMaxDays { get; set; }
    }
}
