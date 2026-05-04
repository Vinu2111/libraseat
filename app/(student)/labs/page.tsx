'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

interface Lab {
  id: string
  name: string
  location: string
  total_seats: number
  available_seats?: number
}

export default function LabsPage() {
  const [labs, setLabs] = useState<Lab[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchLabs()
  }, [])

  async function fetchLabs() {
    const { data: labsData, error } = await supabase
      .from('labs')
      .select('*')

    if (error) {
      console.error('Error fetching labs:', error)
      setLoading(false)
      return
    }

    const labsWithCounts = await Promise.all(
      labsData.map(async (lab) => {
        const { count } = await supabase
          .from('seats')
          .select('*', { count: 'exact', head: true })
          .eq('lab_id', lab.id)
          .eq('status', 'available')

        return { ...lab, available_seats: count || 0 }
      })
    )

    setLabs(labsWithCounts)
    setLoading(false)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-white text-xl">Loading labs...</p>
    </div>
  )

  return (
    <div className="min-h-screen p-4 md:p-8">
      <h1 className="text-3xl font-bold text-white mb-2">Available Labs</h1>
      <p className="text-gray-400 mb-8">Select a lab to view and book a seat.</p>

      {labs.length === 0 ? (
        <p className="text-gray-400">No labs found.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {labs.map((lab) => (
            <div
              key={lab.id}
              onClick={() => router.push(`/seats/${lab.id}`)}
              className="cursor-pointer bg-white/10 border border-white/20 rounded-xl p-6 hover:bg-white/20 transition min-h-[120px] w-full"
            >
              <h2 className="text-xl font-bold text-white mb-1">{lab.name}</h2>
              <p className="text-gray-400 text-sm mb-4">{lab.location}</p>
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Total seats: <strong className="text-white">{lab.total_seats}</strong></span>
                <span className="text-green-400">Available: <strong>{lab.available_seats}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
