namespace EmployeeManagmentAPI.DTOs
{
    public class LeaveMasterUpsertDTO
    {
        public string LeaveType { get; set; } = string.Empty;
        public int MaxDaysAllowed { get; set; }
    }
}
