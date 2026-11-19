"use client";
import React from 'react'
import { useTranslation } from 'react-i18next'
import '@/lib/i18n'

const NoData = () => {
  const { t } = useTranslation()

  return (
    <div className='flex flex-col items-center justify-center text-center px-5 py-12'>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 400 380"
        width="160"
        height="152"
        role="img"
        aria-label={t('common.noData')}
      >
        <style>{`
          @keyframes headTilt {
            0%, 100% { transform: rotate(0deg); }
            25% { transform: rotate(-5deg); }
            75% { transform: rotate(4deg); }
          }
          @keyframes earLeft {
            0%, 100% { transform: rotate(0deg); }
            25% { transform: rotate(-6deg); }
            75% { transform: rotate(2deg); }
          }
          @keyframes earRight {
            0%, 100% { transform: rotate(0deg); }
            25% { transform: rotate(-2deg); }
            75% { transform: rotate(6deg); }
          }
          @keyframes tailWag {
            0%, 100% { transform: rotate(0deg); }
            50% { transform: rotate(16deg); }
          }
          @keyframes blink {
            0%, 92%, 96%, 100% { transform: scaleY(1); }
            94%, 98% { transform: scaleY(0.1); }
          }
          @keyframes breathe {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-2.5px); }
          }
          @keyframes floatQ {
            0%, 100% { transform: translateY(0px) rotate(8deg); opacity: 0.85; }
            50% { transform: translateY(-8px) rotate(14deg); opacity: 1; }
          }
          @keyframes shadowPulse {
            0%, 100% { transform: scaleX(1); opacity: 0.12; }
            50% { transform: scaleX(0.95); opacity: 0.08; }
          }

          .head-group {
            transform-origin: 200px 210px;
            animation: headTilt 4.5s ease-in-out infinite;
          }
          .ear-left {
            transform-origin: 145px 95px;
            animation: earLeft 4.5s ease-in-out infinite;
          }
          .ear-right {
            transform-origin: 255px 95px;
            animation: earRight 4.5s ease-in-out infinite;
          }
          .tail {
            transform-origin: 255px 265px;
            animation: tailWag 0.9s ease-in-out infinite;
          }
          .eyes {
            transform-origin: 200px 148px;
            animation: blink 4s infinite;
          }
          .body-breathe {
            animation: breathe 3s ease-in-out infinite;
          }
          .question-mark {
            transform-origin: 315px 75px;
            animation: floatQ 2.8s ease-in-out infinite;
          }
          .floor-shadow {
            transform-origin: 200px 342px;
            animation: shadowPulse 3s ease-in-out infinite;
          }
        `}</style>

        {/* Floor Shadow */}
        <ellipse className="floor-shadow" cx="200" cy="342" rx="95" ry="14" fill="#1e293b" />

        {/* Floating Question Mark */}
        <g className="question-mark">
          <path d="M 306 64 C 306 53, 324 53, 324 64 C 324 71, 315 73, 315 80" fill="none" stroke="#e09a56" strokeWidth="5" strokeLinecap="round" />
          <circle cx="315" cy="89" r="3" fill="#e09a56" />
        </g>

        {/* Wagging Tail */}
        <g className="tail">
          <path d="M 248 265 C 282 260, 298 238, 302 212 C 288 222, 275 232, 245 238 Z" fill="#f7f4ef" />
          <path d="M 250 265 C 282 260, 298 238, 302 212 C 296 232, 282 248, 250 256 Z" fill="#dfd5c7" />
        </g>

        {/* Body & Legs */}
        <g className="body-breathe">
          <path d="M 142 230 C 115 245, 110 295, 115 322 C 118 335, 148 335, 152 320 L 155 265 Z" fill="#c77732" />
          <path d="M 113 305 L 122 296 L 130 307 L 139 297 L 148 308 L 151 322 C 147 335, 118 335, 115 322 Z" fill="#e8dfd3" />

          <path d="M 258 230 C 285 245, 290 295, 285 322 C 282 335, 252 335, 248 320 L 245 265 Z" fill="#c77732" />
          <path d="M 287 305 L 278 296 L 270 307 L 261 297 L 252 308 L 249 322 C 253 335, 282 335, 285 322 Z" fill="#e8dfd3" />

          <path d="M 152 215 L 248 215 L 258 295 C 258 312, 142 312, 142 295 Z" fill="#e09a56" />

          <path d="M 162 215 L 238 215 C 242 245, 228 275, 200 292 C 172 275, 158 245, 162 215 Z" fill="#f7f4ef" />
          <path d="M 162 215 L 238 215 L 236 228 C 215 235, 185 235, 164 228 Z" fill="#e5dcd0" />

          <path d="M 148 235 L 188 235 L 188 328 C 188 345, 146 345, 146 328 Z" fill="#e09a56" />
          <path d="M 146 310 L 156 300 L 166 312 L 177 301 L 188 312 L 188 328 C 188 345, 146 345, 146 328 Z" fill="#f7f4ef" />

          <path d="M 212 235 L 252 235 L 254 328 C 254 345, 212 345, 212 328 Z" fill="#e09a56" />
          <path d="M 212 312 L 223 301 L 234 312 L 244 300 L 254 310 L 254 328 C 254 345, 212 345, 212 328 Z" fill="#f7f4ef" />
        </g>

        {/* Head */}
        <g className="head-group">
          <g className="ear-left">
            <path d="M 155 95 C 145 72, 132 72, 112 82 L 78 98 C 68 103, 70 125, 82 148 C 94 170, 108 175, 118 164 C 132 148, 145 120, 155 95 Z" fill="#c77732" />
            <path d="M 150 94 C 142 75, 132 75, 114 84 L 84 98 C 76 102, 79 121, 90 140 C 100 158, 111 162, 120 152 C 132 138, 142 115, 150 94 Z" fill="#e09a56" />
            <path d="M 153 96 C 146 86, 136 86, 131 98 L 123 122 C 135 114, 146 105, 153 96 Z" fill="#9a531d" />
          </g>

          <g className="ear-right">
            <path d="M 245 95 C 255 72, 268 72, 288 82 L 322 98 C 332 103, 330 125, 318 148 C 306 170, 292 175, 282 164 C 268 148, 255 120, 245 95 Z" fill="#c77732" />
            <path d="M 250 94 C 258 75, 268 75, 286 84 L 316 98 C 324 102, 321 121, 310 140 C 300 158, 289 162, 280 152 C 268 138, 258 115, 250 94 Z" fill="#e09a56" />
            <path d="M 247 96 C 254 86, 264 86, 269 98 L 277 122 C 265 114, 254 105, 247 96 Z" fill="#9a531d" />
          </g>

          <path d="M 122 145 C 122 95, 160 76, 200 76 C 240 76, 278 95, 278 145 C 278 198, 244 226, 200 226 C 156 226, 122 198, 122 145 Z" fill="#e09a56" />

          <path d="M 122 145 C 122 178, 134 202, 155 215 L 165 185 C 145 178, 130 164, 122 145 Z" fill="#c77732" opacity="0.45" />
          <path d="M 278 145 C 278 178, 266 202, 245 215 L 235 185 C 255 178, 270 164, 278 145 Z" fill="#c77732" opacity="0.45" />

          <path d="M 182 82 L 192 68 L 195 78 L 210 67 L 207 79 L 225 83 L 216 92 C 210 112, 209 135, 212 155 C 238 162, 256 180, 263 202 C 246 218, 224 226, 200 226 C 176 226, 154 218, 137 202 C 144 180, 162 162, 188 155 C 191 135, 190 112, 182 82 Z" fill="#f7f4ef" />

          <path d="M 140 144 C 143 122, 162 108, 178 112 C 183 114, 184 122, 177 123 C 162 124, 148 134, 140 144 Z" fill="#f7f4ef" />
          <path d="M 260 144 C 257 122, 238 108, 222 112 C 217 114, 216 122, 223 123 C 238 124, 252 134, 260 144 Z" fill="#f7f4ef" />

          <g className="eyes">
            <circle cx="166" cy="148" r="18" fill="#9a531d" />
            <circle cx="166" cy="148" r="13" fill="#181512" />
            <circle cx="161" cy="143" r="4.5" fill="#ffffff" />
            <circle cx="171" cy="151" r="2" fill="#ffffff" />

            <circle cx="234" cy="148" r="18" fill="#9a531d" />
            <circle cx="234" cy="148" r="13" fill="#181512" />
            <circle cx="229" cy="143" r="4.5" fill="#ffffff" />
            <circle cx="239" cy="151" r="2" fill="#ffffff" />
          </g>

          <path d="M 185 170 C 185 162, 215 162, 215 170 C 215 178, 206 185, 200 185 C 194 185, 185 178, 185 170 Z" fill="#181512" />
          <ellipse cx="197" cy="168" rx="6" ry="2.2" fill="#ffffff" opacity="0.45" />

          <path d="M 190 198 C 190 212, 210 212, 210 198 Z" fill="#d97b7b" />
          <path d="M 176 192 C 180 202, 195 202, 200 190 C 205 202, 220 202, 224 192" fill="none" stroke="#c8b9a6" strokeWidth="3" strokeLinecap="round" />
        </g>
      </svg>
      <h2 className='mt-3 mb-2 text-xl font-semibold text-slate-800'>{t('common.noDataTitle')}</h2>
      <p className='mb-5 max-w-[340px] text-sm text-slate-500'>{t('common.noDataDescription')}</p>
      <button
        type='button'
        onClick={() => window.location.reload()}
        className='rounded-lg bg-[#e09a56] px-6 py-2.5 font-semibold text-white hover:bg-[#cf8a47] transition-colors'
      >
        {t('common.refreshPage')}
      </button>
    </div>
  )
}

export default NoData
