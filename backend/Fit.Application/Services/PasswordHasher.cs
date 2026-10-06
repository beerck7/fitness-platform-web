using Fit.Application.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Fit.Application.Services
{
    public class PasswordHasher : IPasswordHasher
    {
        private const int WorkFactor = 12;

        public string Hash(string password)
        {
            return BCrypt.Net.BCrypt.EnhancedHashPassword(password, WorkFactor, BCrypt.Net.HashType.SHA384);
        }

        public bool Verify(string password, string hash)
        {
            return BCrypt.Net.BCrypt.EnhancedVerify(password, hash, hashType: BCrypt.Net.HashType.SHA384);
        }
    }
}
