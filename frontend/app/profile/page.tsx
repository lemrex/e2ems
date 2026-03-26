// "use client"

// import type React from "react"

// import { useEffect, useState } from "react"
// import { motion } from "framer-motion"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { useToast } from "@/hooks/use-toast"
// import { ArrowLeft, User, Shield, Camera, Loader2 } from "lucide-react"
// import { useRouter } from "next/navigation"
// import Link from "next/link"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// export default function ProfilePage() {
//   const [user, setUser] = useState<{ id: number; username: string; email: string; createdAt: string } | null>(null)
//   const [isLoading, setIsLoading] = useState(true)
//   const [isUpdating, setIsUpdating] = useState(false)
//   const [username, setUsername] = useState("")
//   const [email, setEmail] = useState("")
//   const [currentPassword, setCurrentPassword] = useState("")
//   const [newPassword, setNewPassword] = useState("")
//   const { toast } = useToast()
//   const router = useRouter()

//   useEffect(() => {
//     const token = localStorage.getItem("token")
//     if (!token) {
//       router.push("/signin")
//       return
//     }
//     fetchProfile()
//   }, [])

//   const fetchProfile = async () => {
//     try {
//       const token = localStorage.getItem("token")
//       const userId = localStorage.getItem("userId")

//       // Note: Following existing pattern of fetching from transactions to find user if no dedicated profile endpoint exists
//       // But we'll attempt to fetch the user object from signin response logic if stored, or a dummy profile fetch
//       // For this implementation, we'll simulate the user data based on the response format we saw earlier
//       const response = await fetch(`https://zenspend.onrender.com/api/auth/profile`, {
//         headers: { Authorization: `Bearer ${token}` },
//       })

//       if (!response.ok) {
//         // Fallback for demo if profile endpoint doesn't exist yet
//         console.warn("[v0] Profile endpoint not found, using local storage hints")
//         setUser({
//           id: Number.parseInt(userId || "0"),
//           username: "testuser",
//           email: "user@example.com",
//           createdAt: new Date().toISOString(),
//         })
//       } else {
//         const data = await response.json()
//         setUser(data.data.user)
//         setUsername(data.data.user.username)
//         setEmail(data.data.user.email)
//       }
//     } catch (error) {
//       console.error("[v0] Profile fetch error:", error)
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const handleUpdateProfile = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setIsUpdating(true)
//     try {
//       const token = localStorage.getItem("token")
//       const response = await fetch("https://zenspend.onrender.com/api/user/update", {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({ username, email }),
//       })

//       if (!response.ok) throw new Error("Failed to update profile")

//       toast({ title: "Profile updated successfully! ✨" })
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Could not update profile. Try again later.",
//         variant: "destructive",
//       })
//     } finally {
//       setIsUpdating(false)
//     }
//   }

//   return (
//     <div className="min-h-screen bg-background relative overflow-hidden">
//       {/* Background effects */}
//       <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
//       <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
//       <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[120px]" />

//       <div className="relative z-10">
//         <div className="glass border-b">
//           <div className="container mx-auto px-4 py-4 flex items-center justify-between">
//             <Link href="/dashboard">
//               <Button variant="ghost" className="rounded-xl">
//                 <ArrowLeft className="mr-2 w-4 h-4" />
//                 Back to Dashboard
//               </Button>
//             </Link>
//             <div className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
//               ZenSpend Profile
//             </div>
//           </div>
//         </div>

//         <div className="container mx-auto px-4 py-8 max-w-4xl">
//           <div className="grid md:grid-cols-[240px_1fr] gap-8">
//             {/* Sidebar / Avatar */}
//             <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
//               <Card className="glass border-2 rounded-2xl p-6 text-center">
//                 <div className="relative inline-block group mb-4">
//                   <Avatar className="w-32 h-32 border-4 border-primary/20">
//                     <AvatarImage src="/placeholder-user.jpg" />
//                     <AvatarFallback className="text-4xl bg-primary/10">
//                       {username?.charAt(0).toUpperCase() || <User />}
//                     </AvatarFallback>
//                   </Avatar>
//                   <Button
//                     size="icon"
//                     className="absolute bottom-0 right-0 rounded-full w-10 h-10 glow-primary border-4 border-background"
//                   >
//                     <Camera className="w-4 h-4" />
//                   </Button>
//                 </div>
//                 <h2 className="text-xl font-bold">{username || "User"}</h2>
//                 <p className="text-sm text-muted-foreground">{email || "email@example.com"}</p>
//                 <div className="mt-4 pt-4 border-t border-primary/10 text-xs text-muted-foreground">
//                   Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "---"}
//                 </div>
//               </Card>
//             </motion.div>

//             {/* Main Forms */}
//             <div className="space-y-6">
//               <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
//                 <Card className="glass border-2 rounded-2xl">
//                   <CardHeader>
//                     <CardTitle className="flex items-center gap-2">
//                       <User className="w-5 h-5 text-primary" />
//                       Personal Information
//                     </CardTitle>
//                     <CardDescription>Update your public username and email address.</CardDescription>
//                   </CardHeader>
//                   <CardContent>
//                     <form onSubmit={handleUpdateProfile} className="space-y-4">
//                       <div className="grid sm:grid-cols-2 gap-4">
//                         <div className="space-y-2">
//                           <Label htmlFor="username">Username</Label>
//                           <Input
//                             id="username"
//                             value={username}
//                             onChange={(e) => setUsername(e.target.value)}
//                             className="rounded-xl glass"
//                           />
//                         </div>
//                         <div className="space-y-2">
//                           <Label htmlFor="email">Email Address</Label>
//                           <Input
//                             id="email"
//                             type="email"
//                             value={email}
//                             onChange={(e) => setEmail(e.target.value)}
//                             className="rounded-xl glass"
//                           />
//                         </div>
//                       </div>
//                       <div className="flex justify-end">
//                         <Button type="submit" className="rounded-xl glow-primary px-8" disabled={isUpdating}>
//                           {isUpdating && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
//                           Save Changes
//                         </Button>
//                       </div>
//                     </form>
//                   </CardContent>
//                 </Card>
//               </motion.div>

//               <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
//                 <Card className="glass border-2 rounded-2xl">
//                   <CardHeader>
//                     <CardTitle className="flex items-center gap-2 text-destructive">
//                       <Shield className="w-5 h-5" />
//                       Security Settings
//                     </CardTitle>
//                     <CardDescription>Change your password to keep your account secure.</CardDescription>
//                   </CardHeader>
//                   <CardContent>
//                     <form className="space-y-4">
//                       <div className="space-y-2">
//                         <Label htmlFor="current-password">Current Password</Label>
//                         <Input
//                           id="current-password"
//                           type="password"
//                           className="rounded-xl glass"
//                           placeholder="••••••••"
//                         />
//                       </div>
//                       <div className="space-y-2">
//                         <Label htmlFor="new-password">New Password</Label>
//                         <Input id="new-password" type="password" className="rounded-xl glass" placeholder="••••••••" />
//                       </div>
//                       <div className="flex justify-end">
//                         <Button
//                           type="button"
//                           variant="outline"
//                           className="rounded-xl border-destructive text-destructive hover:bg-destructive/10 bg-transparent"
//                         >
//                           Update Password
//                         </Button>
//                       </div>
//                     </form>
//                   </CardContent>
//                 </Card>
//               </motion.div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }



"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, User, Shield, Camera, Loader2, Check } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

const PRESET_AVATARS = [
  "/3d-cartoon-avatar-boy-purple.jpg",
  "/3d-cartoon-avatar-girl-pink.jpg",
  "/3d-cartoon-avatar-cool-shades.jpg",
  "/3d-cartoon-avatar-smiling-yellow.jpg",
  "/3d-cartoon-avatar-robot-blue.jpg",
  "/3d-cartoon-avatar-cat-cute.jpg",
]

export default function ProfilePage() {
  const [user, setUser] = useState<{
    id: number
    username: string
    email: string
    createdAt: string
    avatarUrl?: string
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [selectedAvatar, setSelectedAvatar] = useState(PRESET_AVATARS[0])
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/signin")
      return
    }
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token")
      const userId = localStorage.getItem("userId")

      // Note: Following existing pattern of fetching from transactions to find user if no dedicated profile endpoint exists
      // But we'll attempt to fetch the user object from signin response logic if stored, or a dummy profile fetch
      // For this implementation, we'll simulate the user data based on the response format we saw earlier
      const response = await fetch(`https://zenspend.onrender.com/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        // Fallback for demo if profile endpoint doesn't exist yet
        console.warn("[v0] Profile endpoint not found, using local storage hints")
        setUser({
          id: Number.parseInt(userId || "0"),
          username: "testuser",
          email: "user@example.com",
          createdAt: new Date().toISOString(),
        })
      } else {
        const data = await response.json()
        setUser(data.data.user)
        setUsername(data.data.user.username)
        setEmail(data.data.user.email)
        if (data.data.user.avatarUrl) {
          setSelectedAvatar(data.data.user.avatarUrl)
        }
      }
    } catch (error) {
      console.error("[v0] Profile fetch error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("https://zenspend.onrender.com/api/user/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username, email, avatarUrl: selectedAvatar }),
      })

      if (!response.ok) throw new Error("Failed to update profile")

      toast({ title: "Profile updated successfully! ✨" })
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not update profile. Try again later.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentPassword || !newPassword) {
      toast({ title: "Error", description: "Please fill in all password fields.", variant: "destructive" })
      return
    }

    setIsUpdatingPassword(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("https://zenspend.onrender.com/api/user/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update password")
      }

      toast({ title: "Password updated successfully! 🛡️" })
      setCurrentPassword("")
      setNewPassword("")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Could not update password. Try again later.",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[120px]" />

      <div className="relative z-10">
        <div className="glass border-b">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/dashboard">
              <Button variant="ghost" className="rounded-xl">
                <ArrowLeft className="mr-2 w-4 h-4" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              ZenSpend Profile
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="grid md:grid-cols-[240px_1fr] gap-8">
            {/* Sidebar / Avatar */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <Card className="glass border-2 rounded-2xl p-6 text-center">
                <div className="relative inline-block group mb-4">
                  <Avatar className="w-32 h-32 border-4 border-primary/20">
                    <AvatarImage src={selectedAvatar || "/placeholder.svg"} />
                    <AvatarFallback className="text-4xl bg-primary/10">
                      {username?.charAt(0).toUpperCase() || <User />}
                    </AvatarFallback>
                  </Avatar>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="icon"
                        className="absolute bottom-0 right-0 rounded-full w-10 h-10 glow-primary border-4 border-background"
                      >
                        <Camera className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="glass sm:max-w-md border-2 rounded-3xl">
                      <DialogHeader>
                        <DialogTitle>Choose your Avatar</DialogTitle>
                      </DialogHeader>
                      <div className="grid grid-cols-3 gap-4 py-4">
                        {PRESET_AVATARS.map((avatar, index) => (
                          <div
                            key={index}
                            className={cn(
                              "relative cursor-pointer rounded-2xl overflow-hidden border-2 transition-all hover:scale-105",
                              selectedAvatar === avatar ? "border-primary glow-primary" : "border-transparent",
                            )}
                            onClick={() => setSelectedAvatar(avatar)}
                          >
                            <img
                              src={avatar || "/placeholder.svg"}
                              alt={`Avatar ${index}`}
                              className="w-full h-full object-cover"
                            />
                            {selectedAvatar === avatar && (
                              <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                <Check className="text-primary w-6 h-6" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <h2 className="text-xl font-bold">{username || "User"}</h2>
                <p className="text-sm text-muted-foreground">{email || "email@example.com"}</p>
                <div className="mt-4 pt-4 border-t border-primary/10 text-xs text-muted-foreground">
                  Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "---"}
                </div>
              </Card>
            </motion.div>

            {/* Main Forms */}
            <div className="space-y-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card className="glass border-2 rounded-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5 text-primary" />
                      Personal Information
                    </CardTitle>
                    <CardDescription>Update your public username and email address.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="username">Username</Label>
                          <Input
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="rounded-xl glass"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="rounded-xl glass"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button type="submit" className="rounded-xl glow-primary px-8" disabled={isUpdating}>
                          {isUpdating && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
                          Save Changes
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card className="glass border-2 rounded-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                      <Shield className="w-5 h-5" />
                      Security Settings
                    </CardTitle>
                    <CardDescription>Change your password to keep your account secure.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="current-password">Current Password</Label>
                        <Input
                          id="current-password"
                          type="password"
                          className="rounded-xl glass"
                          placeholder="••••••••"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input
                          id="new-password"
                          type="password"
                          className="rounded-xl glass"
                          placeholder="••••••••"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                        />
                      </div>
                      <div className="flex justify-end">
                        <Button
                          type="submit"
                          variant="outline"
                          disabled={isUpdatingPassword}
                          className="rounded-xl border-destructive text-destructive hover:bg-destructive/10 bg-transparent"
                        >
                          {isUpdatingPassword && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
                          Update Password
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
