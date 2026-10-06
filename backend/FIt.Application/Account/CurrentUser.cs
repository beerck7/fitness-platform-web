using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FIt.Application.Account
{
    public record CurrentUser(Guid Id, string Email);
}
