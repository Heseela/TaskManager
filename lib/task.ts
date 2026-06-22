import { getDb } from "./db";

export const taskDb  = {
   getAllTasks: async () => {
    const conn = await getDb();

    const result = await conn
      .request()
      .query(`
        SELECT * from vw_TaskDetails  
        ORDER BY CreatedAt DESC
      `);

    return result.recordset;
  },


  
    getTasksByEmployee: async (employeeId: string) => {
    const conn = await getDb();

    const result = await conn
      .request()
      .input("employeeId", employeeId)
      .query(`
        SELECT * from vw_TaskDetails  
        WHERE assignedTo = @employeeId
        ORDER BY CreatedAt DESC
      `);

    return result.recordset;
  },



    getTasksBySupervisor: async (supervisorId: string) => {
    const conn = await getDb();

    const result = await conn
      .request()
      .input("supervisorId", supervisorId)
      .query(`       
        SELECT * from vw_TaskDetails  
        WHERE assignedBy = @supervisorId
        ORDER BY CreatedAt DESC
      `);

    return result.recordset;
  },

createTask: async (taskData: any) => {
    const conn = await getDb();

    const result = await conn
      .request()
      .input("Title", taskData.title)
      .input("Description", taskData.description)
      .input("AssignedBy", taskData.assignedBy)
      .input("AssignedTo", taskData.assignedTo)
      .input("Status", taskData.status)
      .input("Priority", taskData.priority)
      .input("DueDate", taskData.dueDate || null)
      .query(`
        INSERT INTO TaskTable
        (
          Title,
          Description,
          AssignedBy,
          AssignedTo,
          Status,
          Priority,
          DueDate
        )
        OUTPUT INSERTED.*
        VALUES
        (
          @Title,
          @Description,
          @AssignedBy,
          @AssignedTo,
          @Status,
          @Priority,
          @DueDate
        )
      `);

    return result.recordset[0];
  },  

  getEmployees: async () => {
  const conn = await getDb();

  const result = await conn
    .request()
    .query(`
      SELECT
        ID,
        username
      FROM userTable
      WHERE Role = 'employee'
      ORDER BY username
    `);

   return (result.recordset as { ID: number; username: string }[]).map(emp => ({
     id: emp.ID.toString(),
    name: emp.username,
  }));
},
}