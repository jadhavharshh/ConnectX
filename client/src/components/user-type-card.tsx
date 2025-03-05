'use client'
import React from "react"
import { Card, CardContent, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { User } from "lucide-react"

type Props = {
  value: string
  title: string
  text: string
  userType: string
  setUserType: React.Dispatch<React.SetStateAction<string>>
}

const UserTypeCard = ({ value, title, text, userType, setUserType }: Props) => {
  return (
    <Label htmlFor={value} onClick={() => setUserType(value)}>
      <Card className={cn("w-full cursor-pointer", userType === value && "border-2 border-orange")}>
        <CardContent className="flex justify-between p-2">
          <div className="flex items-center gap-3">
            <Card className={cn("flex justify-center p-3", userType === value && "border-orange")}>
              <User size={30} className={cn(userType === value ? "text-orange" : "text-gray-400")} />
            </Card>
            <div>
              <CardDescription className="text-iridium text-start">{title}</CardDescription>
              <CardDescription className="text-gray-400 text-start">{text}</CardDescription>
            </div>
          </div>
          <div>
            <div
              className={cn("w-4 h-4 rounded-full", userType === value ? "bg-orange" : "bg-transparent")}
            >
              <Input
                value={value}
                id={value}
                className="hidden"
                type="radio"
                readOnly
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </Label>
  )
}

export default UserTypeCard