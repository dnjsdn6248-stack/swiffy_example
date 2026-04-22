import { useEffect, useRef, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useConfirmPaymentMutation } from '@/api/paymentApi'
import Spinner from '@/shared/components/Spinner'

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [confirmPayment] = useConfirmPaymentMutation()

  const paymentKey = searchParams.get('paymentKey')
  const orderId    = searchParams.get('orderId')
  const amount     = searchParams.get('amount')

  const [status, setStatus]     = useState('loading') // 'loading' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('')
  const calledRef = useRef(false)

  useEffect(() => {
    if (calledRef.current) return
    calledRef.current = true

    if (!paymentKey || !orderId || !amount) {
      setErrorMsg('결제 정보가 올바르지 않습니다.')
      setStatus('error')
      return
    }

    confirmPayment({
      paymentKey,
      orderId: Number(orderId),
      amount: Number(amount),
    })
      .unwrap()
      .then(() => {
        setStatus('success')
        setTimeout(() => navigate(`/order/detail/${orderId}`, { replace: true }), 2000)
      })
      .catch((err) => {
        setErrorMsg(err?.data?.message ?? err?.message ?? '결제 승인 중 오류가 발생했습니다.')
        setStatus('error')
      })
  }, []) // eslint-disable-line

  if (status === 'loading') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Spinner />
        <p className="text-[15px] font-bold text-[#555]">결제를 승인하고 있습니다...</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-4">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" />
          </svg>
        </div>
        <h1 className="text-[22px] font-black text-[#111] tracking-tight">결제 승인 실패</h1>
        <p className="text-[14px] text-[#888] text-center">{errorMsg}</p>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/cart')}
            className="h-12 px-6 rounded-full border border-[#eee] text-[#555] font-bold text-[14px] bg-white hover:bg-[#f9f9f9] transition-all cursor-pointer"
          >
            장바구니로 이동
          </button>
          <button
            onClick={() => navigate('/order/list')}
            className="h-12 px-6 rounded-full bg-[#3ea76e] text-white font-bold text-[14px] border-none hover:bg-[#318a57] transition-all cursor-pointer"
          >
            주문 내역 보기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-4">
      <div className="w-16 h-16 rounded-full bg-[#eaf6f0] flex items-center justify-center">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3ea76e" strokeWidth="2.5">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <h1 className="text-[22px] font-black text-[#111] tracking-tight">결제가 완료되었습니다</h1>
      <p className="text-[14px] text-[#888]">주문 상세 페이지로 이동합니다...</p>
      <button
        onClick={() => navigate(`/order/detail/${orderId}`, { replace: true })}
        className="h-12 px-8 rounded-full bg-[#3ea76e] text-white font-bold text-[14px] border-none hover:bg-[#318a57] transition-all cursor-pointer"
      >
        주문 상세 보기
      </button>
    </div>
  )
}
