// -----------------------------------------------------------------------
// <copyright file="UserIdNotFoundException.cs" company="ChessDB.AI">
// MIT Licensed.
// </copyright>
// -----------------------------------------------------------------------

namespace HoratioBot.Storage
{
    using System;
    using System.Runtime.Serialization;

    [Serializable]
    public class UserIdNotFoundException : Exception
    {
        //
        // For guidelines regarding the creation of new exception types, see
        //    http://msdn.microsoft.com/library/default.asp?url=/library/en-us/cpgenref/html/cpconerrorraisinghandlingguidelines.asp
        // and
        //    http://msdn.microsoft.com/library/default.asp?url=/library/en-us/dncscol/html/csharp07192001.asp
        //

        public UserIdNotFoundException()
        {
        }

        public UserIdNotFoundException(string message) : base(message)
        {
        }

        public UserIdNotFoundException(string message, Exception inner) : base(message, inner)
        {
        }

        protected UserIdNotFoundException(
            SerializationInfo info,
            StreamingContext context) : base(info, context)
        {
        }
    }
}