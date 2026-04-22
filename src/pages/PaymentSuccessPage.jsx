import { useEffect, useRef, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useConfirmPaymentMutation } from '@/api/paymentApi'

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [confirmPayment] = useConfirmPaymentMutation()

  const paymentKey = searchParams.get('paymentKey')
  const orderId = searchParams.get('orderId')
  const amount = searchParams.get('amount')

  const [status, setStatus] = useState('loading') // 'loading' | 'success' | 'error'
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
        const msg =
          err?.data?.message ?? err?.message ?? '결제 승인 중 오류가 발생했습니다.'
        setErrorMsg(msg)
        setStatus('error')
      })
  }, [])

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-600">결제를 승인하고 있습니다...</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4">
        <div className="text-5xl">❌</div>
        <h1 className="text-2xl font-bold text-gray-800">결제 승인 실패</h1>
        <p className="text-gray-500 text-center">{errorMsg}</p>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/cart')}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            장바구니로 이동
          </button>
          <button
            onClick={() => navigate('/order/list')}
            className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
          >
            주문 내역 보기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4">
      <div className="text-6xl">✅</div>
      <h1 className="text-2xl font-bold text-gray-800">결제가 완료되었습니다!</h1>
      <p className="text-gray-500">주문 상세 페이지로 이동합니다...</p>
      <button
        onClick={() => navigate(`/order/detail/${orderId}`, { replace: true })}
        className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
      >
        주문 상세 보기
      </button>
    </div>
  )
}
