"use client"

import { useEffect, useState } from "react"
import { UserPlus } from "lucide-react"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/lib/api-client"
import { FETCH_CHAT } from "@/utils/constants"

interface Contact {
  id: string;
  name: string;
  email: string;
  status: string;
}

interface AddContactDialogProps {
  onAddContact?: (userId: string) => void
}

export function AddContactDialog({ onAddContact }: AddContactDialogProps) {
  const [open, setOpen] = useState(false)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(false)

  const fetchContacts = async () => {
    setLoading(true)
    try {
      // Make API call to fetch contacts
      const response = await apiClient.get(FETCH_CHAT)
      // Assume the backend returns data under response.data.contacts
      const fetchedContacts: Contact[] = response.data.contacts.map((user: any) => ({
        id: user._id || user.id,
        name: user.name,
        email: user.email || user.teacherId || user.studentId,
        status: user.status || "online", // default status if not provided
      }))
      setContacts(fetchedContacts)
    } catch (error) {
      console.error("Error fetching contacts:", error)
      setContacts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      fetchContacts()
    }
  }, [open])

  const handleAddContact = (userId: string) => {
    if (onAddContact) {
      onAddContact(userId)
    }
    setOpen(false)
  }

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        className="gap-2" 
        onClick={() => setOpen(true)}
      >
        <UserPlus className="h-4 w-4" />
        <span className="hidden md:inline">Add Contact</span>
      </Button>
      
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search for users to add..." />
        <CommandList>
          {loading ? (
            <CommandEmpty>Loading contacts...</CommandEmpty>
          ) : contacts.length === 0 ? (
            <CommandEmpty>No users found.</CommandEmpty>
          ) : (
            <CommandGroup heading="All Users">
              {contacts.map(user => (
                <CommandItem 
                  key={user.id} 
                  onSelect={() => handleAddContact(user.id)}
                  className="p-2"
                >
                  <Avatar className="h-7 w-7 mr-2">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt={user.name} />
                    <AvatarFallback>
                      {user.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span>{user.name}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  </div>
                  <span className={`ml-auto text-xs ${
                    user.status === "online" ? "text-green-500" : 
                    user.status === "away" ? "text-yellow-500" : "text-gray-500"
                  }`}>
                    {user.status}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  )
}
