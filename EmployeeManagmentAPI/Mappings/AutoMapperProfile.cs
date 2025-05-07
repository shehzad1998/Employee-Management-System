using AutoMapper;
using EmployeeManagmentAPI.DTOs;
using EmployeeManagmentAPI.Enums;
using EmployeeManagmentAPI.Models;

namespace EmployeeManagmentAPI.Mappings
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            // Entity -> DTO
            CreateMap<Employee, EmployeesDTO>()
             .ForMember(dest => dest.DepartmentName, opt => opt.MapFrom(src => src.Department.Name))
            .ForMember(dest => dest.DesignationTitle, opt => opt.MapFrom(src => src.Designation.Title))
            .ForMember(dest => dest.Username, opt => opt.MapFrom(src => src.User.Username))
            .ForMember(dest => dest.UserEmail, opt => opt.MapFrom(src => src.User.Email))
            .ForMember(dest => dest.Role, opt => opt.MapFrom(src => src.User.Role.Name))
            .ForMember(dest => dest.ManagerName, opt => opt.Ignore()).ReverseMap();

            // DTO -> Entity
            CreateMap<EmployeeCreateUpdateDTO, Employee>().ReverseMap();

            // Other mappings
            CreateMap<Department, DepartmentDTO>().ReverseMap();
            CreateMap<Designation, DesignationDtO>().ReverseMap();
            CreateMap<Role, RoleDTO>().ReverseMap();

            CreateMap<User, USerDTO>()
                .ForMember(dest => dest.RoleName, opt => opt.MapFrom(src => src.Role.Name));


            CreateMap<UserCreateDTO, User>().ReverseMap();

            CreateMap<Leave, LeaveDTO>()
                .ForMember(dest => dest.StartDate, opt => opt.MapFrom(src => src.StartDate))
                .ForMember(dest => dest.EndDate, opt => opt.MapFrom(src => src.EndDate))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => (LeaveStatus)src.Status))
                .ForMember(dest => dest.EmployeeId, opt => opt.MapFrom(src => src.EmployeeId))
                .ForMember(dest => dest.ManagerId, opt => opt.MapFrom(src => src.Employee.ManagerId))
                .ForMember(dest => dest.EmployeeName, opt => opt.MapFrom(src => src.Employee.Name))
                .ForMember(dest => dest.LeaveType, opt => opt.MapFrom(src => src.LeaveMaster.LeaveType))
                .ForMember(dest => dest.LeaveMasterId, opt => opt.MapFrom(src => src.LeaveMasterId)).ReverseMap();




            CreateMap<LeaveUpsertDTO, Leave>()
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => (byte)src.Status));

            CreateMap<LeaveApplyDTO, Leave>()
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => LeaveStatus.Pending))
                .ForMember(dest => dest.StartDate, opt => opt.MapFrom(src => src.StartDate))
                .ForMember(dest => dest.EndDate, opt => opt.MapFrom(src => src.EndDate));

            CreateMap<LeaveMaster, LeaveMasterDTO>()
                .ForMember(dest => dest.MaxDaysAllowed, opt => opt.MapFrom(src => src.MaxDays));

            CreateMap<LeaveMasterUpsertDTO, LeaveMaster>()
                .ForMember(dest => dest.MaxDays, opt => opt.MapFrom(src => src.MaxDaysAllowed));

            CreateMap<LeaveBalance, LeaveBalanceDTO>()
               .ForMember(dest => dest.EmployeeName, opt => opt.MapFrom(src => src.Employee.Name))
               .ForMember(dest => dest.LeaveType, opt => opt.MapFrom(src => src.LeaveMaster.LeaveType))
               .ForMember(dest => dest.MaxDays, opt => opt.MapFrom(src => src.TotalDays))
               .ReverseMap()
               .ForPath(src => src.Employee.Name, opt => opt.Ignore())          // Ignore reverse map here
               .ForPath(src => src.LeaveMaster.LeaveType, opt => opt.Ignore()); // Ignore reverse map here

        }
    }
}