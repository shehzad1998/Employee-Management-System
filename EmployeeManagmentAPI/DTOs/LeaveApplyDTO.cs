namespace EmployeeManagmentAPI.DTOs
{
    public class LeaveApplyDTO
    {
        public int EmployeeId { get; set; }
        public DateOnly StartDate { get; set; }
        public DateOnly EndDate { get; set; }
        public int LeaveMasterId { get; set; }


    }
}
