// import { NextRequest, NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/lib/auth';
// import {
//   getTasksBySupervisor,
//   getTasksByEmployee,
//   getTaskById,
//   createTask,
//   updateTask,
// } from '@/lib/taskDb';

// export async function GET(req: NextRequest) {
//   try {
//     const session = await getServerSession(authOptions);

//     if (!session?.user?.id) {
//       return NextResponse.json(
//         { error: 'Unauthorized' },
//         { status: 401 }
//       );
//     }

//     let tasks = [];

//     if (session.user.role === 'supervisor') {
//       tasks = await getTasksBySupervisor(Number(session.user.id));
//     } else {
//       tasks = await getTasksByEmployee(Number(session.user.id));
//     }

//     return NextResponse.json(tasks);
//   } catch (err) {
//     console.error('GET TASKS ERROR:', err);

//     return NextResponse.json(
//       { error: 'Failed to fetch tasks' },
//       { status: 500 }
//     );
//   }
// }

// export async function POST(req: NextRequest) {
//   try {
//     const session = await getServerSession(authOptions);

//     if (!session?.user || session.user.role !== 'supervisor') {
//       return NextResponse.json(
//         { error: 'Unauthorized' },
//         { status: 401 }
//       );
//     }

//     const body = await req.json();

//     const {
//       title,
//       description,
//       assignedTo,
//       assignedToName,
//       priority,
//       dueDate,
//       category,
//     } = body;

//     if (!title || !assignedTo) {
//       return NextResponse.json(
//         { error: 'Title and employee are required' },
//         { status: 400 }
//       );
//     }

//     const task = await createTask({
//       title,
//       description: description || '',
//       assignedBy: Number(session.user.id),
//       assignedTo: Number(assignedTo),
//       assignedByName: session.user.name || '',
//       assignedToName: assignedToName || '',
//       status: 'pending',
//       priority: priority || 'medium',
//       dueDate: dueDate || null,
//       category: category || null,
//     });

//     return NextResponse.json(task, {
//       status: 201,
//     });
//   } catch (err) {
//     console.error('CREATE TASK ERROR:', err);

//     return NextResponse.json(
//       { error: 'Failed to create task' },
//       { status: 500 }
//     );
//   }
// }

// export async function PUT(req: NextRequest) {
//   try {
//     const session = await getServerSession(authOptions);

//     if (!session?.user?.id) {
//       return NextResponse.json(
//         { error: 'Unauthorized' },
//         { status: 401 }
//       );
//     }

//     const { taskId, status } = await req.json();

//     if (!taskId || !status) {
//       return NextResponse.json(
//         { error: 'Task ID and status required' },
//         { status: 400 }
//       );
//     }

//     const task = await getTaskById(Number(taskId));

//     if (!task) {
//       return NextResponse.json(
//         { error: 'Task not found' },
//         { status: 404 }
//       );
//     }

//     if (
//       session.user.role === 'employee' &&
//       task.assignedTo !== Number(session.user.id)
//     ) {
//       return NextResponse.json(
//         { error: 'Unauthorized' },
//         { status: 401 }
//       );
//     }

//     const updatedTask = await updateTask(
//       Number(taskId),
//       status
//     );

//     return NextResponse.json(updatedTask);
//   } catch (err) {
//     console.error('UPDATE TASK ERROR:', err);

//     return NextResponse.json(
//       { error: 'Failed to update task' },
//       { status: 500 }
//     );
//   }
// }


// app/api/tasks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAllTasks, getTasksByEmployee, getTasksBySupervisor, createTask, updateTask } from '@/lib/taskDb';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(req.url);
  const userId = url.searchParams.get('userId');
  const role = session.user.role;

  try {
    let tasks;
    
    if (role === 'supervisor') {
      tasks = await getTasksBySupervisor(session.user.id);
    } else if (role === 'employee') {
      if (userId) {
        // If userId is provided, fetch tasks for that specific user (for supervisor viewing employee tasks)
        if (session.user.role === 'supervisor') {
          tasks = await getTasksByEmployee(Number(userId));
        } else {
          tasks = await getTasksByEmployee(session.user.id);
        }
      } else {
        tasks = await getTasksByEmployee(session.user.id);
      }
    } else {
      tasks = await getAllTasks();
    }

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== 'supervisor') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, description, assignedTo, assignedToName, priority, dueDate, category } = body;

    if (!title || !assignedTo || !assignedToName) {
      return NextResponse.json(
        { error: 'Title, assignedTo, and assignedToName are required' },
        { status: 400 }
      );
    }

    const task = await createTask({
      title,
      description: description || '',
      assignedBy: session.user.id,
      assignedTo,
      assignedByName: session.user.name || 'Supervisor',
      assignedToName,
      status: 'pending',
      priority: priority || 'medium',
      dueDate: dueDate || null,
      category: category || null,
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { taskId, status } = body;

    if (!taskId || !status) {
      return NextResponse.json(
        { error: 'Task ID and status are required' },
        { status: 400 }
      );
    }

    const task = await updateTask(taskId, status);
    
    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}