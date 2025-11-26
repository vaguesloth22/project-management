import { Inngest } from "inngest";
import prisma from "../configs/prisma.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "project-management" });


// Inngest function to save user data to a database: 
const syncUserCreation = inngest.createFunction(
  {id: 'sync-user-from-clerk'}, 
  {event: 'clerk/user.created'}, 
  async ({ event }) => {
    const {data} = event

    // debug line chk
    console.log("Clerk webhook data: ", JSON.stringify(data, null, 2)); 
    const email = data?.email_addresses[0]?.email_address || data?.primary_email_address_id || '';

    if (!email) {
      console.error('No eamil found for user'); 
      return;
    }
    await prisma.user.create({  
      data: {
        id: data.id, 
        email: email,
        name: data?.first_name + " " + data?.last_name, 
        image: data?.image_url,
      }
    })
  }
)

// Inngest function to delete user data from database: 
const deleteUserDeletion = inngest.createFunction(
  {id: 'delete-user-with-clerk'}, 
  {event: 'clerk/user.deleted'}, 
  async ({ event }) => {
    const {data} = event
    await prisma.user.delete({  
      where: {
        id: data.id, 
      }
    })
  }
)

// Inngest function to update user data in database: 
const updateUserUpdation = inngest.createFunction(
  {id: 'update-user-from-clerk'}, 
  {event: 'clerk/user.updated'}, 
  async ({ event }) => {
    const {data} = event
    await prisma.user.update({  
      where: {
        id: data.id, 
      }, 
      data: {
        email: email,
        name: data?.first_name + " " + data?.last_name || '', 
        image: data?.image_url || ''
      }
    })
  }
)

// Create an empty array where we'll export future Inngest functions
export const functions = [syncUserCreation, deleteUserDeletion, updateUserUpdation];