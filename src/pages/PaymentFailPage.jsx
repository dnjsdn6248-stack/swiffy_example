import { useSearchParams, useNavigate } from 'react-router-dom'

export default function PaymentFailPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const code = searchParams.get('code') ?? '알 수 없음'
  const message = searchParams.get('message') ?? '결제에 실패했습니다.'
  const orderId = searchParams.get('orderId')

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4">
      <div className="text-5xl">❌</div>
      <h1 className="text-2xl font-bold text-gray-800">결제에 실패했습니다</h1>
      <div className="bg-gray-50 border border-gray-200 rounded-lg px-6 py-4 text-sm text-gray-600 space-y-1 w-full max-w-sm">
        {orderId && <p><span className="font-medium">주문 번호:</span> {orderId}</p>}
        <p><span className="font-medium">오류 코드:</span> {code}</p>
        <p><span className="font-medium">오류 메시지:</span> {decodeURIComponent(message)}</p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => navigate('/cart')}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          장바구니로 돌아가기
        </button>
        <button
          onClick={() => navigate('/checkout')}
          className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
        >
          다시 결제하기
        </button>
      </div>
    </div>
  )
}
