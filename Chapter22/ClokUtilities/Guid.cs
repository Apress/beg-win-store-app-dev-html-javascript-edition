using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ClokUtilities
{
    public sealed class Guid
    {
        public static string NewGuid()
        {
            return System.Guid.NewGuid().ToString();
        }

        public static bool IsGuid(string guidToTest)
        {
            if (string.IsNullOrEmpty(guidToTest))
            {
                return false;
            }

            System.Guid guid;
            return System.Guid.TryParse(guidToTest, out guid);
        }
    }
}
