namespace EmployeeManagmentAPI.DTOs
{
    public class EmployeesDTO
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Phone { get; set; }

        public string? Role { get; set; }
        public int DepartmentId { get; set; }
        public string? DepartmentName { get; set; }

        public int DesignationId { get; set; }
        public string? DesignationTitle { get; set; }

        public int UserId { get; set; }
        public string? Username { get; set; }
        public string? UserEmail { get; set; }
        public string? ManagerId { get; set; }
        public string? ManagerName { get; set; }



    }
}
