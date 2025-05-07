using AutoMapper;
using EmployeeManagmentAPI.Repositories.Interfaces;
using EmployeeManagmentAPI.Services.Interfaces;

namespace EmployeeManagmentAPI.Services.Implementation
{
    public class GenericService<TEntity, TDto> : IGenericService<TDto> where TEntity : class
    {
        private readonly IGenericRepository<TEntity> _repository;
        private readonly IMapper _mapper;

        public GenericService(IGenericRepository<TEntity> repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<IEnumerable<TDto>> GetAllAsync()
        {
            var entities = await _repository.GetAllAsync();
            return _mapper.Map<IEnumerable<TDto>>(entities);
        }

        public async Task<TDto?> GetByIdAsync(int id)
        {
            var entity = await _repository.GetByIdAsync(id);
            return entity == null ? default : _mapper.Map<TDto>(entity);
        }

        public async Task<TDto> CreateAsync(TDto dto)
        {
            var entity = _mapper.Map<TEntity>(dto);
            var created = await _repository.AddAsync(entity);
            return _mapper.Map<TDto>(created);
        }

        public async Task<bool> UpdateAsync(int id, TDto dto)
        {
            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) return false;

            _mapper.Map(dto, existing);
            return await _repository.UpdateAsync(existing);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            return await _repository.DeleteAsync(id);
        }
    }
}
