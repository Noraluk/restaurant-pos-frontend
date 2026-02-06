import { useNavigate } from 'react-router-dom'

function UserProfilePage() {
  const navigate = useNavigate()

  return (
    <div className="profilePage">
      <div className="profileHeader">
        <button type="button" className="profileBackButton" onClick={() => navigate('/')}>
          กลับ
        </button>
        <div className="profileTitle">โปรไฟล์</div>
        <div></div>
      </div>
      <div className="profileCard">
        <div className="profileAvatarLarge" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
            <circle cx="12" cy="10" r="3" fill="currentColor" />
            <path d="M7 18a5 5 0 0 1 10 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <div className="profileName">ผู้ใช้</div>
        <div className="profileMeta">จัดการข้อมูลผู้ใช้ได้ที่หน้านี้</div>
      </div>
    </div>
  )
}

export default UserProfilePage
