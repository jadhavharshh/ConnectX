"use client"

import * as React from "react"
import {
  UserPlus,
} from "lucide-react"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

// Mock user data - would be replaced with actual API call
const mockUsers = [
  { id: "1", name: "Alice Johnson", email: "alice@example.com", status: "online" },
  { id: "2", name: "Bob Smith", email: "bob@example.com", status: "offline" },
  { id: "3", name: "Carol Williams", email: "carol@example.com", status: "online" },
  { id: "4", name: "Dave Brown", email: "dave@example.com", status: "away" },
  { id: "5", name: "Eva Martinez", email: "eva@example.com", status: "online" },
  { id: "6", name: "Frank Chen", email: "frank@example.com", status: "offline" },
  { id: "7", name: "Grace Lee", email: "grace@example.com", status: "online" },
  { id: "8", name: "Henry Wilson", email: "henry@example.com", status: "online" },
]

interface AddContactDialogProps {
  onAddContact?: (userId: string) => void
}

export function AddContactDialog({ onAddContact }: AddContactDialogProps) {
  const [open, setOpen] = React.useState(false)

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
      
      <CommandDialog open={open} onOpenChange={setOpen}  >
        <CommandInput placeholder="Search for users to add..." />
        <CommandList>
          <CommandEmpty>No users found.</CommandEmpty>
          <CommandGroup heading="Suggested Contacts">
            {mockUsers
              .filter(user => user.status === "online")
              .slice(0, 3)
              .map(user => (
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
                  <span className="ml-auto text-xs text-green-500">online</span>
                </CommandItem>
              ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="All Users">
            {mockUsers.map(user => (
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
        </CommandList>
      </CommandDialog>
    </>
  )
}