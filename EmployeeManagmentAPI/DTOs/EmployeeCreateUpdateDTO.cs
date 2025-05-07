namespace EmployeeManagmentAPI.DTOs
{
    public class EmployeeCreateUpdateDTO
    {
        public string Name { get; set; } = null!;
        public string Phone { get; set; } = null!;
        public int DepartmentId { get; set; }
        public int DesignationId { get; set; }
        public int? ManagerId { get; set; }
        public UserCreateDTO User { get; set; }

    }
}
