using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using ESRGC.GIS.Domain.DAL.Abstract;
using ESRGC.GIS.Domain.Contexts.SalisburyCity;
using System.Data.Entity;
using System.Data;
using System.Linq.Expressions;

namespace ESRGC.GIS.Domain.DAL.Concrete
{
    public class EntityRepository<TEntity> : IEntityRepository<TEntity> where TEntity : class
    {
        internal SalisburyCityEFContext _context;
        internal IDbSet<TEntity> _dbSet;

        public EntityRepository(SalisburyCityEFContext context)
        {
            _context = context;
            _dbSet = _context.Set<TEntity>();
        }

        public virtual IEnumerable<TEntity> Get(
           Expression<Func<TEntity, bool>> filter = null,
           Func<IQueryable<TEntity>, IOrderedQueryable<TEntity>> orderBy = null,
           string includeProperties = "")
        {
            IQueryable<TEntity> query = _dbSet;

            if (filter != null)
            {
                query = query.Where(filter);
            }

            foreach (var includeProperty in includeProperties.Split
                (new char[] { ',' }, StringSplitOptions.RemoveEmptyEntries))
            {
                query = query.Include(includeProperty);
            }

            if (orderBy != null)
            {
                return orderBy(query).ToList();
            }
            else
            {
                return query.ToList();
            }
        }

        #region IRepository<TEntity> Members

        public IQueryable<TEntity> Entities
        {
            get { return _dbSet; }
        }

        public TEntity GetEntityByID(object ID)
        {
            return _dbSet.Find(ID);
        }


        public void InsertEntity(TEntity entity)
        {
            _dbSet.Add(entity);
        }

        public void UpdateEntity(TEntity entity)
        {
            _dbSet.Attach(entity);
            _context.Entry(entity).State = EntityState.Modified;
        }

        public void DeleteByID(object ID)
        {
            var entityToDelete = _dbSet.Find(ID);
            DeleteEntity(entityToDelete);
        }

        public void DeleteEntity(TEntity entity)
        {
            if (_context.Entry(entity).State == EntityState.Detached)
            {
                _dbSet.Attach(entity);
            }
            _dbSet.Remove(entity);
        }


        #endregion
    }
}
