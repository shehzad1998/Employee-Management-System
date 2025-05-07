using EmployeeManagmentAPI.Models;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace EmployeeManagmentAPI.DTOs
{
    public class LeaveBalanceDTO
    {
        [Key]
        public int Id { get; set; }

        [ForeignKey("Employee")]
        public int EmployeeId { get; set; }

        public string? EmployeeName { get; set; }

        [ForeignKey("LeaveMaster")]
        public int LeaveMasterId { get; set; }

        public string? LeaveType { get; set; }

        public int MaxDays { get; set; }

        public int UsedDays { get; set; }

        public int RemainingDays { get; set; }

      
    }
}
