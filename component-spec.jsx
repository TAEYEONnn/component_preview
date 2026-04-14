// 터미널 열고 아래 쳐서 로컬 주소 복사해서 보기
// cd C:\Users\Admin\Desktop\claude_test
// npm run dev

//업데이트 시
// npx vercel --prod

//수정시 항상 염두하세요
//git pull
//git add .
//git commit -m "맥북에서 수정"
//git push
import { useState, useEffect } from "react";

// ─── DESIGN TOKENS ──────────────────────────────────────────────────────────
const tokens = {
  card: "bg-white border border-[#ebebeb] rounded-[14px] overflow-hidden",
  divider: "h-px bg-[#f3f3f3]",
  badge: {
    green:  { bg: "bg-[#e8f5e9]",              text: "text-[#2e7d32]" },
    blue:   { bg: "bg-[#e8f0fe]",              text: "text-[#1a73e8]" },
    indigo: { bg: "bg-[rgba(99,102,241,0.09)]",text: "text-[#6366f1]" },
    amber:  { bg: "bg-[#fff8e1]",              text: "text-[#f57f17]" },
    red:    { bg: "bg-[#fce4ec]",              text: "text-[#c62828]" },
    gray:   { bg: "bg-[#f5f5f5]",              text: "text-[#888]" },
    purple: { bg: "bg-[rgba(139,92,246,0.09)]",text: "text-[#8b5cf6]" },
    sky:    { bg: "bg-[rgba(14,165,233,0.09)]",text: "text-[#0ea5e9]" },
    emerald:{ bg: "bg-[rgba(34,197,94,0.09)]", text: "text-[#22c55e]" },
  },
};

// ─── BADGE ───────────────────────────────────────────────────────────────────
function Badge({ text, color = "gray", size = "sm" }) {
  const c = tokens.badge[color] || tokens.badge.gray;
  const sz = size === "sm" ? "text-[10px] px-[7px] py-[2px]" : "text-[11px] px-[8px] py-[3px]";
  return (
    <span className={`inline-flex items-center rounded-full font-bold ${c.bg} ${c.text} ${sz} whitespace-nowrap`}>
      {text}
    </span>
  );
}

// ─── TOGGLE ──────────────────────────────────────────────────────────────────
function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-[44px] h-[26px] rounded-full transition-colors ${checked ? "bg-[#6366f1]" : "bg-[#ddd]"}`}
    >
      <span
        className={`absolute top-[2px] left-0 w-[22px] h-[22px] bg-white rounded-full shadow transition-transform ${
          checked ? "translate-x-[20px]" : "translate-x-[2px]"
        }`}
      />
    </button>
  );
}

// ─── CARD SLOT ───────────────────────────────────────────────────────────────
/**
 * CardSlot
 * @prop {("card"|"list")} mode       - 레이아웃 모드
 * @prop {number}          gap        - 카드 모드 아이템 간격 (px)  [default: 10]
 * @prop {string}          title      - 섹션 타이틀
 * @prop {("신규"|"기존")}  badge      - 섹션 뱃지
 * @prop {ReactNode}       children   - 아이템 목록
 */
function CardSlot({ mode = "card", gap = 10, title, badge, children }) {
  const items = Array.isArray(children) ? children : [children];
  return (
    <div>
      {title && (
        <div className="flex items-center gap-1.5 mb-[10px]">
          <span className="font-bold text-[13px] text-[#1d1d1f]">{title}</span>
          {badge && <Badge text={badge} color={badge === "신규" ? "blue" : "gray"} />}
        </div>
      )}
      {mode === "card" ? (
        <div style={{ display: "flex", flexDirection: "column", gap }}>
          {items.map((child, i) => (
            <div key={i} className={tokens.card}>{child}</div>
          ))}
        </div>
      ) : (
        <div className={tokens.card}>
          {items.map((child, i) => (
            <div key={i}>
              {child}
              {i < items.length - 1 && <div className={tokens.divider} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── LIST ITEM ────────────────────────────────────────────────────────────────
/**
 * ListItem  — 범용 리스트 셀: 좌측 에셋 + 1~3줄 텍스트 + 우측 요소 + 상태
 *
 * @prop {Object}  [asset]      - 에셋 (좌측 시각 요소)
 *   { type, src, icon, size, shape, background }  → Asset 컴포넌트 props와 동일
 *   type: "icon"|"emoji"|"image"|"avatar"  [default: "emoji"]
 *   size: "sm"(28)|"md"(40)|"lg"(52)|"xl"(72)|px 숫자
 *
 * @prop {(string|Object)} [primary]   - 메인 텍스트 (1번째 줄)
 * @prop {(string|Object)} [secondary] - 서브 텍스트 (2번째 줄)
 * @prop {(string|Object)} [tertiary]  - 보조 텍스트 (3번째 줄)
 *   TextObject: { text, size(xs~xl), weight(normal/medium/bold), color(hex), truncate(bool), lines(number) }
 *
 * @prop {Object}  [right]      - 우측 요소
 *   { type: "none"|"arrow"|"badge"|"text"|"toggle"|"button"|"menu"|"custom" }
 *   badge  → + { badge: { text, color, size } }
 *   text   → + { text, color }
 *   toggle → + { checked, onChange }
 *   button → + { label, variant, size }
 *   custom → + { content: ReactNode }
 *
 * @prop {boolean} [clickable]  - 클릭 가능 여부  [default: false]
 * @prop {boolean} [disabled]   - 비활성 상태  [default: false]
 * @prop {boolean} [restricted] - 접근 제한 상태  [default: false]
 * @prop {boolean} [selected]   - 선택 상태  [default: false]
 * @prop {("start"|"center")} [align]  - 에셋·우측 요소 세로 정렬  [default: "start"]
 * @prop {string}  [paddingY]   - 상하 여백 Tailwind 클래스  [default: "py-3"]
 * @prop {Function} [onClick]   - 행 전체 클릭 핸들러
 */
function ListItem({
  asset,
  primary,
  secondary,
  tertiary,
  right,
  clickable = false,
  disabled = false,
  restricted = false,
  selected = false,
  align = "start",
  paddingY = "py-3",
  onClick,
}) {
  const isClickable = clickable || !!onClick;

  const TEXT_SIZE = { xs: "text-[11px]", sm: "text-[12px]", md: "text-[13px]", lg: "text-[14px]", xl: "text-[15px]" };
  const TEXT_WEIGHT = { normal: "font-normal", medium: "font-medium", bold: "font-bold", semibold: "font-semibold" };

  function resolveText(val, defaults) {
    if (!val && val !== 0) return null;
    if (typeof val === "string" || typeof val === "number") return { text: String(val), ...defaults };
    return { ...defaults, ...val };
  }

  const p = resolveText(primary,   { size: "lg",  weight: "medium", color: "#1d1d1f" });
  const s = resolveText(secondary, { size: "sm",  weight: "normal", color: "#888" });
  const t = resolveText(tertiary,  { size: "xs",  weight: "normal", color: "#aaa" });

  function renderText(obj) {
    if (!obj) return null;
    const sizeClass   = TEXT_SIZE[obj.size]   || "text-[14px]";
    const weightClass = TEXT_WEIGHT[obj.weight] || "font-normal";
    const truncateClass = obj.truncate
      ? (obj.lines > 1 ? `line-clamp-${obj.lines}` : "truncate")
      : "";
    return (
      <span
        className={`leading-snug ${sizeClass} ${weightClass} ${truncateClass}`}
        style={obj.color ? { color: obj.color } : {}}
      >
        {obj.text}
      </span>
    );
  }

  function renderRight() {
    if (!right || right.type === "none") return null;
    if (right.type === "arrow") {
      return <span className="text-[16px] text-[#c7c7cc]">›</span>;
    }
    if (right.type === "badge") {
      const b = right.badge || {};
      return <Badge text={b.text} color={b.color || "gray"} size={b.size || "md"} />;
    }
    if (right.type === "text") {
      return (
        <span className="text-[13px] font-medium" style={{ color: right.color || "#888" }}>
          {right.text}
        </span>
      );
    }
    if (right.type === "toggle") {
      return <Toggle checked={right.checked ?? false} onChange={right.onChange ?? (() => {})} />;
    }
    if (right.type === "button") {
      const b = right.button || {};
      return (
        <CTAButton
          label={b.label || right.label || "확인"}
          variant={b.variant || right.variant || "primary"}
          size={b.size || right.size || "sm"}
          state={b.state || "default"}
        />
      );
    }
    if (right.type === "menu") {
      return <Asset type="icon" icon="⋯" size={32} shape="circle" background="transparent" />;
    }
    if (right.type === "custom") {
      return right.content || null;
    }
    return null;
  }

  const rightEl = renderRight();

  const stateClass = [
    disabled ? "opacity-40 pointer-events-none" : "",
    restricted && !disabled ? "opacity-55" : "",
    selected ? "bg-[rgba(99,102,241,0.06)]" : "",
    isClickable && !disabled ? "cursor-pointer active:bg-[#f5f5f7] transition-colors" : "",
  ].filter(Boolean).join(" ");

  const alignClass = align === "center" ? "items-center" : "items-start";

  return (
    <div
      className={`flex ${alignClass} px-4 ${paddingY} gap-3 ${stateClass}`}
      onClick={!disabled ? onClick : undefined}
    >
      {/* Asset */}
      {asset && (
        <div className={`shrink-0${align === "start" ? " mt-0.5" : ""}`}>
          <Asset
            type={asset.type || "emoji"}
            src={asset.src}
            icon={asset.icon}
            size={asset.size || "md"}
            shape={asset.shape || "rounded"}
            background={asset.background}
          />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        {p && <div className="flex items-center gap-1.5 flex-wrap">{renderText(p)}</div>}
        {s && <div className="mt-0.5">{renderText(s)}</div>}
        {t && <div className="mt-0.5">{renderText(t)}</div>}
      </div>

      {/* Right */}
      {rightEl && (
        <div className={`flex items-center shrink-0${align === "start" ? " mt-0.5" : ""}`}>
          {rightEl}
        </div>
      )}
    </div>
  );
}

// ─── CLASS CARD ───────────────────────────────────────────────────────────────
/**
 * ClassCard
 * @prop {string}  time              - 수업 시간 ("10:00")
 * @prop {string}  title             - 반 이름
 * @prop {string}  location          - 지점명
 * @prop {("개인 레슨"|"그룹 레슨")} lessonType
 * @prop {string}  date              - 날짜 ("2026.04.05")
 * @prop {number}  totalSeats        - 전체 정원
 * @prop {number}  remainingSeats    - 잔여석
 * @prop {number}  [waitingCount]    - 대기자 수
 * @prop {number}  [myWaitingPos]    - 내 대기 순번
 * @prop {boolean} [isToday]         - 오늘 여부
 * @prop {("available"|"waitlist"|"closed")} status - 신청 상태
 */
function ClassCard({ time, title, location, lessonType, date, totalSeats, remainingSeats, waitingCount, myWaitingPos, isToday, status }) {
  const seatColor = remainingSeats === 0 ? "text-[#ef4444]" : remainingSeats <= 3 ? "text-[#ef4444]" : "text-[#22c55e]";
  return (
    <div className="px-4 py-3.5">
      <div className="flex items-start justify-between gap-2">
        {/* Left info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-[16px] text-[#1d1d1f]">{time}</span>
            {isToday && <Badge text="오늘" color="red" size="md" />}
          </div>
          <p className="font-bold text-[14px] text-[#333] mt-1">{title}</p>
          <p className="text-[12px] text-[#888] mt-0.5">{location} · {lessonType} · {date}</p>
          <p className="text-[12px] text-[#888] mt-0.5">
            전체 {totalSeats}석 · 잔여 <span className={`font-bold ${seatColor}`}>{remainingSeats}석</span>
            {waitingCount !== undefined && ` · 대기 ${waitingCount}명`}
          </p>
          {myWaitingPos !== undefined && (
            <p className="text-[12px] font-bold text-[#f59e0b] mt-0.5">⏳ 현재 대기 {myWaitingPos}번째</p>
          )}
        </div>

        {/* Right CTA */}
        <div className="shrink-0 mt-1">
          {status === "available" && (
            <button className="bg-[#6366f1] text-white text-[13px] font-bold px-3.5 h-[32px] rounded-[8px]">담기</button>
          )}
          {status === "waitlist" && (
            <button className="bg-[#fff8e1] text-[#f59e0b] text-[13px] font-bold px-3 h-[32px] rounded-[8px]">대기담기</button>
          )}
          {status === "closed" && (
            <button className="bg-[#f5f5f7] text-[#bbb] text-[13px] font-bold px-3.5 h-[32px] rounded-[8px]" disabled>마감</button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── APPLICATION CARD ─────────────────────────────────────────────────────────
/**
 * ApplicationCard
 * @prop {string}  academyName        - 학원명
 * @prop {string}  className          - 수업명
 * @prop {string}  schedule           - 일정 텍스트
 * @prop {("신청완료"|"대기중"|"취소됨")} status
 * @prop {boolean} [showMoreMenu]     - ⋯ 메뉴 표시 여부  [default: true]
 * @prop {string}  [ctaLabel]         - 하단 버튼 텍스트 (없으면 버튼 숨김)
 * @prop {("primary"|"ghost")} [ctaVariant] - 버튼 스타일  [default: "primary"]
 */
function ApplicationCard({ academyName, className, schedule, status, showMoreMenu = true, ctaLabel, ctaVariant = "primary" }) {
  const statusBadge = {
    "신청완료": { color: "green" },
    "대기중":   { color: "amber" },
    "취소됨":   { color: "red" },
  }[status] || { color: "gray" };

  return (
    <div className="px-4 py-3.5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[13px] text-[#888]">{academyName}</p>
          <p className="font-bold text-[15px] text-[#1d1d1f] mt-0.5">{className}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Badge text={status} color={statusBadge.color} size="md" />
          {showMoreMenu && status !== "취소됨" && (
            <button className="text-[#aaa] text-[20px] leading-none pb-0.5">⋯</button>
          )}
        </div>
      </div>
      <p className="text-[13px] text-[#555] mt-2">📅 {schedule}</p>
      {ctaLabel && (
        <button
          className={`w-full mt-3 h-[36px] rounded-[8px] text-[14px] font-bold ${
            ctaVariant === "primary"
              ? "bg-[#6366f1] text-white"
              : "bg-[#f5f5f7] text-[#6366f1]"
          }`}
        >
          {ctaLabel}
        </button>
      )}
    </div>
  );
}

// ─── ACADEMY CARD ─────────────────────────────────────────────────────────────
/**
 * AcademyCard  ← ListItem 기반 베리에이션
 * @prop {string} icon             - 이모지
 * @prop {string} category         - 카테고리 ("IT 계열 · 코딩")  → ListItem label
 * @prop {string} academyName      - 학원명 + 지점               → ListItem description
 * @prop {string} registeredDate   - 등록일                       → ListItem meta
 * @prop {string} applicationNumber- 원서번호                     → ListItem meta
 * @prop {Function} [onClick]      - 클릭 핸들러
 */
function AcademyCard({ icon, category, academyName, registeredDate, applicationNumber, onClick }) {
  return (
    <ListItem
      asset={{ type: "emoji", icon, size: "lg" }}
      primary={category}
      secondary={academyName}
      tertiary={`등록일 ${registeredDate}  ·  원서번호 ${applicationNumber}`}
      right={{ type: "arrow" }}
      clickable
      onClick={onClick}
    />
  );
}


// ─── ASSET ───────────────────────────────────────────────────────────────────
/**
 * Asset — 아이콘·이모지·이미지·아바타를 일관된 규격으로 표시하는 기본 UI 컴포넌트.
 * Badge·Toggle처럼 다른 컴포넌트 안에서 재사용되거나 단독으로 사용됩니다.
 *
 * @prop {("icon"|"emoji"|"image"|"avatar")} [type]  [default: "emoji"]
 *   icon   : 텍스트/SVG 아이콘 (icon prop)
 *   emoji  : 이모지 (icon prop)
 *   image  : 이미지 URL (src prop)
 *   avatar : 프로필 이미지. src 없으면 기본 👤 표시
 * @prop {string}  [src]         - 이미지/아바타 URL
 * @prop {string}  [icon]        - 아이콘 문자 또는 이모지
 * @prop {string}  [alt]         - 이미지 대체 텍스트  [default: ""]
 * @prop {(number|"sm"|"md"|"lg"|"xl")} [size]  [default: "md"]
 *   sm=28  md=40  lg=52  xl=72  또는 직접 px 숫자 입력
 * @prop {("circle"|"square"|"rounded")} [shape]  [default: "rounded"]
 * @prop {string}  [background]  - 배경색 (없으면 type별 기본값)
 */
function Asset({ type = "emoji", src, icon, alt = "", size = "md", shape = "rounded", background }) {
  const SIZE_MAP = { sm: 28, md: 40, lg: 52, xl: 72 };
  const px = typeof size === "number" ? size : (SIZE_MAP[size] ?? 40);

  const SHAPE = {
    circle:  "rounded-full",
    square:  "rounded-none",
    rounded: "rounded-[10px]",
  };

  const DEFAULT_BG = {
    icon:   "#f5f5f7",
    emoji:  "#f5f5f7",
    image:  "#e8e8e8",
    avatar: "#e8e8f0",
  };
  const bg = background || DEFAULT_BG[type] || "#f5f5f7";
  const fontSize = px * (type === "avatar" ? 0.48 : 0.52);

  return (
    <div
      style={{ width: px, height: px, minWidth: px, backgroundColor: bg }}
      className={`${SHAPE[shape] || SHAPE.rounded} flex items-center justify-center shrink-0 overflow-hidden`}
    >
      {(type === "image" || (type === "avatar" && src))
        ? <img src={src} className="w-full h-full object-cover" alt={alt} />
        : type === "avatar"
        ? <span style={{ fontSize }}>👤</span>
        : <span style={{ fontSize }}>{icon}</span>
      }
    </div>
  );
}

// ─── NAV BAR (GlobalHeader + TopBar 병합) ────────────────────────────────────
/**
 * NavBar
 * @prop {("global"|"page")} [variant]       - 화면 유형 [default: "page"]
 *
 * — variant="global" (홈 화면 헤더) —
 * @prop {boolean} [logoClickable]           - 로고 클릭 가능 여부 [default: true]
 * @prop {boolean} [showNotification]        - 알림 아이콘 노출 [default: true]
 * @prop {boolean} [showNotificationBadge]   - 알림 빨간 점 뱃지 [default: false]
 * @prop {boolean} [showMenu]                - 전체메뉴 아이콘 노출 [default: true]
 *
 * — variant="page" (내부 페이지 헤더) —
 * @prop {string}  [title]                   - 중앙 타이틀
 * @prop {("back"|"close"|"none")} [leftIcon]- 좌측 아이콘 [default: "back"]
 * @prop {string}  [rightIcon1]              - 우측 아이콘1 (search/share/setting/more/alarm/none)
 * @prop {string}  [rightIcon2]              - 우측 아이콘2
 * @prop {number}  [notificationCount]       - 알림 숫자 뱃지 (0이면 숨김)
 */
function NavBar({
  variant = "page",
  title = "",
  leftIcon = "back",
  rightIcon1,
  rightIcon2,
  notificationCount = 0,
  logoClickable = true,
  showNotification = true,
  showNotificationBadge = false,
  showMenu = true,
}) {
  const iconMap = { back: "‹", close: "✕", search: "🔍", share: "↗", setting: "⚙️", more: "⋯", alarm: "🔔", home: "🏠" };

  if (variant === "global") {
    return (
      <div className="flex items-center justify-between h-[56px] px-4 bg-white border-b border-[#ebebeb]">
        <span className={`font-bold text-[18px] text-[#6366f1] ${logoClickable ? "cursor-pointer" : "cursor-default"}`}>LOGO</span>
        <div className="flex items-center gap-3">
          {showNotification && (
            <div className="relative">
              <button className="text-[22px] text-[#1d1d1f]">🔔</button>
              {showNotificationBadge && <span className="absolute -top-0.5 -right-0.5 w-[8px] h-[8px] rounded-full bg-[#ef4444]" />}
            </div>
          )}
          {showMenu && <button className="text-[22px] text-[#1d1d1f]">☰</button>}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between h-[52px] px-4 bg-white border-b border-[#ebebeb]">
      <div className="w-[60px] flex items-center">
        {leftIcon && leftIcon !== "none" && (
          <button className="text-[20px] text-[#1d1d1f]">{iconMap[leftIcon] || leftIcon}</button>
        )}
      </div>
      <span className="font-bold text-[15px] text-[#1d1d1f] truncate">{title}</span>
      <div className="w-[60px] flex items-center justify-end gap-3">
        {rightIcon1 && rightIcon1 !== "none" && (
          <div className="relative">
            <button className="text-[20px] text-[#1d1d1f]">{iconMap[rightIcon1] || rightIcon1}</button>
            {rightIcon1 === "alarm" && notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 w-[16px] h-[16px] rounded-full bg-[#ef4444] text-white text-[9px] font-bold flex items-center justify-center">{notificationCount}</span>
            )}
          </div>
        )}
        {rightIcon2 && rightIcon2 !== "none" && (
          <button className="text-[20px] text-[#1d1d1f]">{iconMap[rightIcon2] || rightIcon2}</button>
        )}
      </div>
    </div>
  );
}

// ─── CTA BUTTON ───────────────────────────────────────────────────────────────
/**
 * CTAButton
 * @prop {string}  label                                                       - 버튼 텍스트
 * @prop {("primary"|"secondary"|"ghost"|"danger"|"text")} [variant]          - 버튼 유형  [default: "primary"]
 * @prop {("sm"|"md"|"lg")} [size]                                             - 버튼 크기  [default: "md"]
 * @prop {("default"|"pressed"|"disabled"|"loading")} [state]                 - 버튼 상태  [default: "default"]
 * @prop {boolean} [fullWidth]                                                 - 전체 너비 여부  [default: false]
 */
function CTAButton({ label, variant = "primary", size = "md", state = "default", disabled = false, fullWidth = false, onClick }) {
  const isDisabled = disabled || state === "disabled";
  const isLoading  = state === "loading";
  const isPressed  = state === "pressed";

  const BASE = {
    primary:   { default: "bg-[#6366f1] text-white",                          pressed: "bg-[#4f46e5] text-white"                          },
    secondary: { default: "bg-[#e8f0fe] text-[#1a73e8]",                      pressed: "bg-[#d2e3fc] text-[#1a73e8]"                      },
    ghost:     { default: "bg-white border border-[#ddd] text-[#333]",        pressed: "bg-[#f5f5f7] border border-[#ddd] text-[#333]"    },
    danger:    { default: "bg-[#fce4ec] text-[#c62828]",                      pressed: "bg-[#f8bbd0] text-[#c62828]"                      },
    text:      { default: "bg-transparent text-[#6366f1]",                    pressed: "bg-transparent text-[#4f46e5]"                    },
  };

  const sizes = {
    sm: "h-[32px] px-3.5 text-[12px] rounded-[8px]",
    md: "h-[42px] px-5 text-[14px] rounded-[10px]",
    lg: "h-[52px] px-6 text-[15px] rounded-[12px]",
  };

  const variantStyle = (BASE[variant] || BASE.primary)[isPressed ? "pressed" : "default"];
  const stateClass = isDisabled ? "opacity-40 cursor-not-allowed"
    : isLoading ? "opacity-70 cursor-wait"
    : "active:scale-[0.97]";

  return (
    <button
      disabled={isDisabled || isLoading}
      onClick={onClick}
      className={`font-bold transition-all ${variantStyle} ${sizes[size]} ${fullWidth ? "w-full" : ""} ${stateClass}`}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-[3px]">
          <span className="w-[4px] h-[4px] rounded-full bg-current animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-[4px] h-[4px] rounded-full bg-current animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-[4px] h-[4px] rounded-full bg-current animate-bounce" style={{ animationDelay: "300ms" }} />
        </span>
      ) : label}
    </button>
  );
}

// ─── INPUT FIELD ──────────────────────────────────────────────────────────────
/**
 * InputField
 * @prop {string}  label        - 입력 레이블
 * @prop {string}  [value]      - 입력값
 * @prop {string}  [placeholder]
 * @prop {string}  [hint]       - 안내 텍스트
 * @prop {string}  [error]      - 에러 메시지 (있으면 에러 스타일)
 * @prop {boolean} [disabled]
 * @prop {string}  [type]       - input type [default: "text"]
 */
function InputField({ label, value, placeholder, hint, error, disabled = false, type = "text" }) {
  const borderColor = error ? "border-[#ef4444]" : "border-[#ddd] focus-within:border-[#6366f1]";
  return (
    <div className={`flex flex-col gap-1 ${disabled ? "opacity-50" : ""}`}>
      {label && <label className="text-[12px] font-bold text-[#444]">{label}</label>}
      <div className={`flex items-center h-[44px] px-3 rounded-[10px] border bg-white transition-colors ${borderColor}`}>
        <input
          type={type}
          defaultValue={value}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 text-[14px] text-[#1d1d1f] outline-none bg-transparent placeholder-[#bbb]"
        />
      </div>
      {error && <p className="text-[11px] text-[#ef4444]">{error}</p>}
      {!error && hint && <p className="text-[11px] text-[#aaa]">{hint}</p>}
    </div>
  );
}

// ─── TEXT AREA ────────────────────────────────────────────────────────────────
/**
 * TextArea
 * @prop {string}  label
 * @prop {string}  [value]
 * @prop {string}  [placeholder]
 * @prop {number}  [rows]        [default: 4]
 * @prop {string}  [hint]
 * @prop {string}  [error]
 * @prop {boolean} [disabled]
 */
function TextArea({ label, value, placeholder, rows = 4, hint, error, disabled = false }) {
  const borderColor = error ? "border-[#ef4444]" : "border-[#ddd] focus-within:border-[#6366f1]";
  return (
    <div className={`flex flex-col gap-1 ${disabled ? "opacity-50" : ""}`}>
      {label && <label className="text-[12px] font-bold text-[#444]">{label}</label>}
      <div className={`px-3 py-2.5 rounded-[10px] border bg-white transition-colors ${borderColor}`}>
        <textarea
          defaultValue={value}
          placeholder={placeholder}
          rows={rows}
          disabled={disabled}
          className="w-full text-[14px] text-[#1d1d1f] outline-none bg-transparent placeholder-[#bbb] resize-none"
        />
      </div>
      {error && <p className="text-[11px] text-[#ef4444]">{error}</p>}
      {!error && hint && <p className="text-[11px] text-[#aaa]">{hint}</p>}
    </div>
  );
}

// ─── IMAGE ATTACHMENT ─────────────────────────────────────────────────────────
/**
 * ImageAttachment
 * @prop {string[]} [images]   - 첨부된 이미지 URL 목록
 * @prop {number}   [maxCount] - 최대 첨부 개수  [default: 5]
 * @prop {boolean}  [disabled]
 */
function ImageAttachment({ images = [], maxCount = 5, disabled = false }) {
  const remaining = maxCount - images.length;
  return (
    <div className={`flex gap-2 flex-wrap ${disabled ? "opacity-50" : ""}`}>
      {images.map((src, i) => (
        <div key={i} className="relative w-[72px] h-[72px] rounded-[10px] overflow-hidden bg-[#f5f5f7]">
          <img src={src} className="w-full h-full object-cover" alt="" />
          {!disabled && (
            <button className="absolute top-0.5 right-0.5 w-[18px] h-[18px] rounded-full bg-[rgba(0,0,0,0.5)] text-white text-[10px] flex items-center justify-center">✕</button>
          )}
        </div>
      ))}
      {remaining > 0 && !disabled && (
        <button className="w-[72px] h-[72px] rounded-[10px] border-2 border-dashed border-[#ddd] flex flex-col items-center justify-center text-[#aaa] gap-0.5">
          <span className="text-[20px]">+</span>
          <span className="text-[10px]">{images.length}/{maxCount}</span>
        </button>
      )}
    </div>
  );
}

// ─── STEP INDICATOR ───────────────────────────────────────────────────────────
/**
 * StepIndicator
 * @prop {string[]} steps    - 각 단계 레이블
 * @prop {number}   current  - 현재 단계 (1-based)
 * @prop {("dot"|"bar")} [variant] [default: "bar"]
 */
function StepIndicator({ steps, current, variant = "bar" }) {
  if (variant === "dot") {
    return (
      <div className="flex items-center gap-1.5 justify-center">
        {steps.map((_, i) => (
          <div key={i} className={`rounded-full transition-all ${i + 1 === current ? "w-[20px] h-[8px] bg-[#6366f1]" : "w-[8px] h-[8px] bg-[#e0e0e0]"}`} />
        ))}
      </div>
    );
  }
  return (
    <div className="flex items-center">
      {steps.map((label, i) => (
        <div key={i} className="flex items-center flex-1">
          <div className="flex flex-col items-center gap-1">
            <div className={`w-[24px] h-[24px] rounded-full flex items-center justify-center text-[11px] font-bold ${
              i + 1 < current ? "bg-[#6366f1] text-white" :
              i + 1 === current ? "bg-[#6366f1] text-white ring-4 ring-[rgba(99,102,241,0.2)]" :
              "bg-[#e0e0e0] text-[#aaa]"
            }`}>{i + 1 < current ? "✓" : i + 1}</div>
            <span className={`text-[10px] font-medium whitespace-nowrap ${i + 1 <= current ? "text-[#6366f1]" : "text-[#aaa]"}`}>{label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-[2px] mb-4 mx-1 ${i + 1 < current ? "bg-[#6366f1]" : "bg-[#e0e0e0]"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── EMPTY TEXT ───────────────────────────────────────────────────────────────
/**
 * EmptyText
 * @prop {string} [icon]       - 이모지 아이콘
 * @prop {string} title        - 빈 상태 타이틀
 * @prop {string} [description]- 보조 설명
 * @prop {string} [ctaLabel]   - 버튼 텍스트 (없으면 숨김)
 */
function EmptyText({ icon, title, description, ctaLabel }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center gap-2">
      {icon && <span className="text-[40px] mb-1">{icon}</span>}
      <p className="font-bold text-[15px] text-[#333]">{title}</p>
      {description && <p className="text-[13px] text-[#aaa] leading-snug">{description}</p>}
      {ctaLabel && (
        <button className="mt-3 h-[38px] px-5 rounded-[10px] bg-[#6366f1] text-white text-[13px] font-bold">{ctaLabel}</button>
      )}
    </div>
  );
}

// ─── MODAL ────────────────────────────────────────────────────────────────────
/**
 * Modal (인라인 미리보기용)
 * @prop {string} title
 * @prop {string} [description]
 * @prop {string} [primaryLabel]    [default: "확인"]
 * @prop {string} [secondaryLabel]  [default: "취소"]
 * @prop {("default"|"danger")} [variant] [default: "default"]
 */
function Modal({ title, description, primaryLabel = "확인", secondaryLabel = "취소", variant = "default" }) {
  const primaryStyle = variant === "danger" ? "bg-[#ef4444] text-white" : "bg-[#6366f1] text-white";
  return (
    <div className="bg-white rounded-[16px] shadow-xl w-[280px] overflow-hidden">
      <div className="px-5 pt-5 pb-4">
        <p className="font-bold text-[16px] text-[#1d1d1f] text-center">{title}</p>
        {description && <p className="text-[13px] text-[#888] text-center mt-1.5 leading-snug">{description}</p>}
      </div>
      <div className="h-px bg-[#f3f3f3]" />
      <div className="flex">
        <button className="flex-1 h-[48px] text-[14px] font-medium text-[#888]">{secondaryLabel}</button>
        <div className="w-px bg-[#f3f3f3]" />
        <button className="flex-1 h-[48px] text-[14px] font-bold text-[#6366f1]">{primaryLabel}</button>
      </div>
    </div>
  );
}



// ─── PROPS TABLE ──────────────────────────────────────────────────────────────
function PropsTable({ rows }) {
  return (
    <div className="overflow-x-auto mt-3 mb-6">
      <table className="w-full text-[12px] border-collapse">
        <thead>
          <tr className="bg-[#f5f5f7]">
            {["Prop", "Type", "Default", "Description"].map(h => (
              <th key={h} className="text-left px-3 py-2 font-bold text-[#444] border border-[#e5e5e5]">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-[#fafafa]"}>
              <td className="px-3 py-2 font-mono font-bold text-[#6366f1] border border-[#e5e5e5]">{r.prop}</td>
              <td className="px-3 py-2 font-mono text-[#e06c75] border border-[#e5e5e5]">{r.type}</td>
              <td className="px-3 py-2 font-mono text-[#888] border border-[#e5e5e5]">{r.default || "—"}</td>
              <td className="px-3 py-2 text-[#555] border border-[#e5e5e5]">{r.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── SECTION HEADER ──────────────────────────────────────────────────────────
function SectionHeader({ name, tag }) {
  return (
    <div className="flex items-center gap-2 mb-1">
      <h2 className="text-[18px] font-bold text-[#1d1d1f]">{name}</h2>
      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#e8f0fe] text-[#1a73e8]">{tag}</span>
    </div>
  );
}

function SubHeader({ label }) {
  return <p className="text-[11px] font-bold text-[#6366f1] uppercase tracking-widest mt-6 mb-3">{label}</p>;
}


// ─── BOTTOM NAVIGATION BAR ──────────────────────────────────────────────────
function BottomNavigationBar({ tabs = ["홈", "검색", "내 수업", "커뮤니티", "마이"], activeTab: initialActive = "홈" }) {
  const [activeTab, setActiveTab] = useState(initialActive);
  const tabIcons = { "홈": "🏠", "검색": "🔍", "내 수업": "📚", "커뮤니티": "💬", "마이": "👤", "알림": "🔔", "장바구니": "🛒" };
  return (
    <div className="flex items-end justify-around h-[56px] bg-white border-t border-[#ebebeb] px-2">
      {tabs.map(tab => (
        <button key={tab} onClick={() => setActiveTab(tab)} className={`flex flex-col items-center gap-0.5 py-1.5 min-w-[48px] transition-colors ${tab === activeTab ? "text-[#6366f1]" : "text-[#aaa]"}`}>
          <span className="text-[20px]">{tabIcons[tab] || "📌"}</span>
          <span className={`text-[10px] ${tab === activeTab ? "font-bold" : "font-medium"}`}>{tab}</span>
        </button>
      ))}
    </div>
  );
}

// ─── TAB BAR ─────────────────────────────────────────────────────────────────
function TabBar({ tabs = [], activeTab: initialActive, style = "underline" }) {
  const [activeTab, setActiveTab] = useState(initialActive ?? tabs[0]);
  if (style === "segment") {
    return (
      <div className="flex bg-[#f5f5f7] rounded-[10px] p-[3px]">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-[13px] font-bold rounded-[8px] transition-all ${
              tab === activeTab ? "bg-white text-[#1d1d1f] shadow-sm" : "text-[#888]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    );
  }
  return (
    <div className="flex border-b border-[#ebebeb]">
      {tabs.map(tab => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`flex-1 py-3 text-[13px] font-bold text-center transition-colors relative ${
            tab === activeTab ? "text-[#6366f1]" : "text-[#aaa]"
          }`}
        >
          {tab}
          {tab === activeTab && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#6366f1]" />}
        </button>
      ))}
    </div>
  );
}

// ─── DRAWER MENU ─────────────────────────────────────────────────────────────
/**
 * DrawerMenu
 * @prop {("guest"|"nonStudent"|"student")} [loginState]  [default: "guest"]
 *   guest      : 비회원 — 로그인 CTA, 최소 카테고리 메뉴
 *   nonStudent : 회원(미수강) — 프로필 + 자주 쓰는 서비스 + 학원 생활 클릭 시 Toast
 *   student    : 수강생 — 프로필 + 자주 쓰는 서비스 편집 + 전체 카테고리 메뉴
 * @prop {boolean} [isOpen]       [default: true]
 * @prop {boolean} [_demoToast]   [default: false] 문서 프리뷰용 — toast 강제 표시
 */
function DrawerMenu({ loginState = "guest", isOpen = true, _demoToast = false }) {
  if (!isOpen) return null;
  const [toastVisible, setToastVisible] = useState(_demoToast);

  const triggerToast = () => {
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2500);
  };

  const QUICK_SERVICES = [
    { icon: "📋", label: "수업 신청" },
    { icon: "📚", label: "내 수업" },
    { icon: "📬", label: "원서함" },
    { icon: "🛒", label: "장바구니" },
    { icon: "📢", label: "공지사항" },
  ];

  /* 카테고리 메뉴 정의
     showFor  : 해당 loginState에서 노출
     restricted: true → 클릭 시 Toast 표시 (nonStudent용)  */
  const CATEGORIES = [
    {
      icon: "📣", label: "학원 소식",
      showFor: ["guest", "nonStudent", "student"],
      restricted: false,
    },
    {
      icon: "🏫", label: "학원 생활",
      showFor: ["nonStudent", "student"],        // guest에게 숨김
      restricted: loginState === "nonStudent",   // nonStudent는 클릭 제한
    },
    {
      icon: "🎯", label: "합격 준비",
      showFor: ["guest", "nonStudent", "student"],
      restricted: false,
    },
    {
      icon: "💬", label: "고객센터",
      showFor: ["guest", "nonStudent", "student"],
      restricted: false,
    },
  ];

  const isLoggedIn = loginState !== "guest";
  const visibleCats = CATEGORIES.filter(c => c.showFor.includes(loginState));

  return (
    <div className="w-[280px] bg-white border border-[#ebebeb] rounded-[14px] overflow-hidden">

      {/* ── 헤더 ── */}
      <div className="px-5 py-4 border-b border-[#f3f3f3]">
        {isLoggedIn ? (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <Asset type="avatar" size={44} shape="circle" />
              <div>
                <p className="font-bold text-[15px] text-[#1d1d1f]">홍길동님</p>
                <p className="text-[11px] text-[#888] mt-0.5">hong@email.com</p>
              </div>
            </div>
            <button className="text-[12px] font-medium text-[#6366f1] shrink-0">편집</button>
          </div>
        ) : (
          <div>
            <p className="font-bold text-[15px] text-[#1d1d1f]">로그인이 필요합니다</p>
            <p className="text-[12px] text-[#888] mt-1">로그인 후 모든 서비스를 이용하세요</p>
            <button className="mt-3 w-full h-[40px] rounded-[10px] bg-[#6366f1] text-white text-[13px] font-bold">
              로그인 / 회원가입
            </button>
          </div>
        )}
      </div>

      {/* ── 자주 쓰는 서비스 (로그인 시만) ── */}
      {isLoggedIn && (
        <div className="px-4 py-3 border-b border-[#f3f3f3]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-[#aaa] uppercase tracking-wider">자주 쓰는 서비스</span>
            <button className="text-[11px] font-medium text-[#6366f1]">편집</button>
          </div>
          <div className="flex justify-between">
            {QUICK_SERVICES.map((s, i) => (
              <button key={i} className="flex flex-col items-center gap-1.5">
                <Asset type="emoji" icon={s.icon} size={46} shape="rounded" />
                <span className="text-[10px] text-[#555] whitespace-nowrap">{s.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── 카테고리 메뉴 ── */}
      <div className="py-1">
        {visibleCats.map((cat, i) => (
          <button
            key={i}
            onClick={() => cat.restricted && triggerToast()}
            className={`w-full flex items-center gap-3 px-5 py-3 text-left transition-colors ${
              cat.restricted ? "opacity-55" : "hover:bg-[#f5f5f7]"
            }`}
          >
            <span className="text-[18px]">{cat.icon}</span>
            <span className="text-[14px] font-medium text-[#1d1d1f]">{cat.label}</span>
            {cat.restricted
              ? <span className="ml-auto text-[10px] font-bold text-[#aaa] bg-[#f5f5f7] px-2 py-0.5 rounded-full">수강생 전용</span>
              : <span className="ml-auto text-[16px] text-[#c7c7cc]">›</span>
            }
          </button>
        ))}
      </div>

      {/* ── 접근 제한 Toast ── */}
      {toastVisible && (
        <div className="px-4 pb-3 flex justify-center">
          <Toast text="수강생만 접근 가능한 메뉴입니다." type="info" />
        </div>
      )}

      {/* ── 로그아웃 ── */}
      {isLoggedIn && (
        <div className="px-5 py-3 border-t border-[#f3f3f3]">
          <button className="text-[13px] text-[#888]">로그아웃</button>
        </div>
      )}
    </div>
  );
}

// ─── SELECT FIELD ────────────────────────────────────────────────────────────
function SelectField({ variant = "form", label, options = [], value, status = "default", placeholder = "선택하세요", error }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(value);
  const isDisabled = status === "disabled";
  const borderColor = error ? "border-[#ef4444]" : status === "selected" ? "border-[#6366f1]" : "border-[#ddd]";

  if (variant === "inline") {
    return (
      <div className={`inline-flex items-center gap-1 ${isDisabled ? "opacity-50" : "cursor-pointer"}`}>
        <span className={`text-[13px] font-medium ${selected ? "text-[#1d1d1f]" : "text-[#888]"}`}>{selected || placeholder}</span>
        <span className="text-[10px] text-[#aaa]">▾</span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-1 ${isDisabled ? "opacity-50" : ""}`}>
      {label && <label className="text-[12px] font-bold text-[#444]">{label}</label>}
      <div className="relative">
        <button
          onClick={() => !isDisabled && setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between h-[44px] px-3 rounded-[10px] border bg-white transition-colors ${borderColor}`}
        >
          <span className={`text-[14px] ${selected ? "text-[#1d1d1f]" : "text-[#bbb]"}`}>{selected || placeholder}</span>
          <span className={`text-[12px] text-[#aaa] transition-transform ${isOpen ? "rotate-180" : ""}`}>▾</span>
        </button>
        {isOpen && options.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#ebebeb] rounded-[10px] shadow-lg z-10 overflow-hidden">
            {options.map((opt, i) => (
              <button
                key={i}
                onClick={() => { setSelected(opt); setIsOpen(false); }}
                className={`w-full text-left px-3 py-2.5 text-[14px] hover:bg-[#f5f5f7] transition-colors ${opt === selected ? "text-[#6366f1] font-bold" : "text-[#1d1d1f]"}`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>
      {error && <p className="text-[11px] text-[#ef4444]">{error}</p>}
    </div>
  );
}

// ─── CHECKBOX ────────────────────────────────────────────────────────────────
function Checkbox({ text, checked = false, type = "optional", showArrow = false, onChange }) {
  const [isChecked, setIsChecked] = useState(checked);
  const handleChange = () => { const next = !isChecked; setIsChecked(next); onChange?.(next); };
  const isAllAgree = type === "all";
  return (
    <button onClick={handleChange} className={`flex items-center gap-2.5 w-full py-2.5 ${isAllAgree ? "border-b border-[#ebebeb] pb-3 mb-1" : ""}`}>
      <div className={`w-[22px] h-[22px] rounded-[6px] flex items-center justify-center shrink-0 transition-colors ${
        isChecked ? "bg-[#6366f1] text-white" : "border-2 border-[#ddd] bg-white"
      }`}>
        {isChecked && <span className="text-[12px]">✓</span>}
      </div>
      <span className={`flex-1 text-left text-[14px] ${isAllAgree ? "font-bold text-[#1d1d1f]" : "text-[#333]"}`}>
        {type === "required" && <span className="text-[#ef4444] mr-1">[필수]</span>}
        {type === "optional" && <span className="text-[#888] mr-1">[선택]</span>}
        {text}
      </span>
      {showArrow && <span className="text-[16px] text-[#c7c7cc] shrink-0">›</span>}
    </button>
  );
}

// ─── RADIO BUTTON ────────────────────────────────────────────────────────────
function RadioButton({ options = [], value, disabled = false, onChange }) {
  const [selected, setSelected] = useState(value);
  const handleSelect = (opt) => { if (!disabled) { setSelected(opt); onChange?.(opt); } };
  return (
    <div className={`flex flex-col gap-2 ${disabled ? "opacity-50" : ""}`}>
      {options.map((opt, i) => (
        <button key={i} onClick={() => handleSelect(opt)} className="flex items-center gap-2.5 py-1.5" disabled={disabled}>
          <div className={`w-[20px] h-[20px] rounded-full border-2 flex items-center justify-center transition-colors ${
            selected === opt ? "border-[#6366f1]" : "border-[#ddd]"
          }`}>
            {selected === opt && <div className="w-[10px] h-[10px] rounded-full bg-[#6366f1]" />}
          </div>
          <span className={`text-[14px] ${selected === opt ? "font-medium text-[#1d1d1f]" : "text-[#555]"}`}>{opt}</span>
        </button>
      ))}
    </div>
  );
}

// ─── SEARCH BAR ──────────────────────────────────────────────────────────────
function SearchBar({ placeholder = "검색어를 입력하세요", value = "" }) {
  const [query, setQuery] = useState(value);
  return (
    <div className="flex items-center h-[44px] px-3 rounded-[10px] bg-[#f5f5f7] gap-2">
      <span className="text-[16px] text-[#aaa]">🔍</span>
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder={placeholder}
        className="flex-1 text-[14px] text-[#1d1d1f] outline-none bg-transparent placeholder-[#bbb]"
      />
      {query && (
        <button onClick={() => setQuery("")} className="w-[18px] h-[18px] rounded-full bg-[#ccc] text-white text-[10px] flex items-center justify-center">✕</button>
      )}
    </div>
  );
}

// ─── DATE PICKER ─────────────────────────────────────────────────────────────
function DatePicker({ type = "calendar", value }) {
  const [selected, setSelected] = useState(value || "");
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const monthNames = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];

  if (type === "rolling") {
    const years = [2024, 2025, 2026, 2027];
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    return (
      <div className="bg-white border border-[#ebebeb] rounded-[14px] p-4 w-[300px]">
        <p className="text-[12px] font-bold text-[#444] mb-3">날짜 선택 (롤링)</p>
        <div className="flex gap-2 justify-center">
          {[{ label: "년", items: years }, { label: "월", items: months }, { label: "일", items: days }].map(col => (
            <div key={col.label} className="flex flex-col items-center">
              <span className="text-[10px] text-[#aaa] mb-1">{col.label}</span>
              <div className="h-[120px] overflow-y-auto w-[60px] border border-[#ebebeb] rounded-[8px]">
                {col.items.map(item => (
                  <div key={item} className="text-center py-1.5 text-[13px] text-[#333] hover:bg-[#f5f5f7] cursor-pointer">{item}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
        {selected && <p className="text-[12px] text-[#6366f1] text-center mt-3 font-medium">선택: {selected}</p>}
      </div>
    );
  }

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  return (
    <div className="bg-white border border-[#ebebeb] rounded-[14px] p-4 w-[300px]">
      <div className="flex items-center justify-between mb-3">
        <button className="text-[16px] text-[#888]">‹</button>
        <span className="font-bold text-[14px] text-[#1d1d1f]">{year}년 {monthNames[month]}</span>
        <button className="text-[16px] text-[#888]">›</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {["일", "월", "화", "수", "목", "금", "토"].map(d => (
          <span key={d} className="text-[10px] text-[#aaa] font-bold py-1">{d}</span>
        ))}
        {days.map((d, i) => (
          <button
            key={i}
            onClick={() => d && setSelected(`${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`)}
            className={`h-[32px] text-[12px] rounded-full transition-colors ${
              !d ? "" :
              selected === `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
                ? "bg-[#6366f1] text-white font-bold"
                : d === today.getDate() ? "text-[#6366f1] font-bold" : "text-[#333] hover:bg-[#f5f5f7]"
            }`}
            disabled={!d}
          >
            {d || ""}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── TAG CHIP ────────────────────────────────────────────────────────────────
function TagChip({ type = "keyword-filter", text, selected = false, maxSelect, onToggle }) {
  const [isSelected, setIsSelected] = useState(selected);
  const handleClick = () => { const next = !isSelected; setIsSelected(next); onToggle?.(next); };
  const styles = {
    "interest": isSelected
      ? "bg-[#6366f1] text-white border-[#6366f1]"
      : "bg-white text-[#555] border-[#ddd]",
    "recommend-question": "bg-[#f0f0ff] text-[#6366f1] border-[#e0e0ff]",
    "related-question": "bg-[#f5f5f7] text-[#555] border-[#ebebeb]",
    "keyword-filter": isSelected
      ? "bg-[#6366f1] text-white border-[#6366f1]"
      : "bg-white text-[#555] border-[#ddd]",
  };
  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center px-3 py-1.5 rounded-full text-[12px] font-medium border transition-colors ${styles[type] || styles["keyword-filter"]}`}
    >
      {text}
      {type === "interest" && maxSelect && <span className="ml-1 text-[10px] opacity-70">({maxSelect})</span>}
    </button>
  );
}

// ─── FLOATING CART BUTTON ────────────────────────────────────────────────────
function FloatingCartButton({ count = 0 }) {
  const isActive = count > 0;
  return (
    <button
      className={`relative w-[56px] h-[56px] rounded-full shadow-lg flex items-center justify-center transition-colors ${
        isActive ? "bg-[#6366f1]" : "bg-[#ccc]"
      }`}
      disabled={!isActive}
    >
      <span className="text-[24px]">🛒</span>
      {isActive && (
        <span className="absolute -top-1 -right-1 w-[22px] h-[22px] rounded-full bg-[#ef4444] text-white text-[11px] font-bold flex items-center justify-center">
          {count}
        </span>
      )}
    </button>
  );
}

// ─── TOAST ───────────────────────────────────────────────────────────────────
function Toast({ text, type = "info", duration = 3 }) {
  const styles = {
    info: "bg-[#1d1d1f] text-white",
    error: "bg-[#ef4444] text-white",
    success: "bg-[#22c55e] text-white",
  };
  const icons = { info: "ℹ️", error: "⚠️", success: "✅" };
  return (
    <div className={`inline-flex items-center gap-2 px-4 py-3 rounded-[12px] shadow-lg ${styles[type]}`}>
      <span className="text-[14px]">{icons[type]}</span>
      <span className="text-[13px] font-medium">{text}</span>
      <span className="text-[10px] opacity-60 ml-2">{duration}s</span>
    </div>
  );
}

// ─── BOTTOM SHEET ────────────────────────────────────────────────────────────
function BottomSheet({ type = "default", title, isOpen = true, children, services = [], defaultSelected = [], maxSelect = 10 }) {
  const [selectedServices, setSelectedServices] = useState(defaultSelected);

  if (!isOpen) return null;

  const toggleService = (id) => {
    setSelectedServices(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : prev.length < maxSelect ? [...prev, id] : prev
    );
  };

  const contents = {
    "login-prompt": (
      <div className="text-center py-4">
        <p className="text-[32px] mb-3">🔒</p>
        <p className="font-bold text-[16px] text-[#1d1d1f]">로그인이 필요합니다</p>
        <p className="text-[13px] text-[#888] mt-1">로그인 후 이용해주세요</p>
        <button className="w-full mt-4 h-[48px] rounded-[12px] bg-[#6366f1] text-white font-bold text-[15px]">로그인하기</button>
        <button className="w-full mt-2 h-[42px] text-[13px] text-[#888]">회원가입</button>
      </div>
    ),
    "account-find": (
      <div className="py-4">
        <p className="font-bold text-[16px] text-[#1d1d1f] mb-4">계정 찾기</p>
        <button className="w-full h-[48px] rounded-[10px] border border-[#ebebeb] text-[14px] font-medium text-[#333] mb-2">아이디 찾기</button>
        <button className="w-full h-[48px] rounded-[10px] border border-[#ebebeb] text-[14px] font-medium text-[#333]">비밀번호 찾기</button>
      </div>
    ),
    "consult": (
      <div className="py-4">
        <p className="font-bold text-[16px] text-[#1d1d1f] mb-2">상담 신청</p>
        <p className="text-[13px] text-[#888] mb-4">원하시는 상담 방법을 선택해주세요</p>
        <button className="w-full h-[48px] rounded-[10px] bg-[#6366f1] text-white font-bold text-[14px] mb-2">전화 상담</button>
        <button className="w-full h-[48px] rounded-[10px] bg-[#f5f5f7] text-[#333] font-bold text-[14px]">채팅 상담</button>
      </div>
    ),
    "waitlist": (
      <div className="py-4">
        <p className="font-bold text-[16px] text-[#1d1d1f] mb-2">대기 신청</p>
        <p className="text-[13px] text-[#888] mb-4">현재 잔여석이 없습니다. 대기 신청하시겠습니까?</p>
        <button className="w-full h-[48px] rounded-[10px] bg-[#f59e0b] text-white font-bold text-[14px]">대기 신청하기</button>
      </div>
    ),
    "quick-service": (
      <div>
        <div className="flex items-center justify-between mb-4 mt-1">
          <span className="text-[17px] font-bold text-[#1a1a18]">자주 쓰는 서비스</span>
          <span className="text-[13px] text-[#464c53] tracking-[-0.08px]">{selectedServices.length}/{maxSelect}</span>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-5 px-5" style={{ scrollbarWidth: "none" }}>
          {services.map(service => {
            const isSel = selectedServices.includes(service.id);
            return (
              <button key={service.id} onClick={() => toggleService(service.id)} className="flex flex-col items-center gap-1.5 shrink-0">
                <div className={`w-[60px] h-[58px] rounded-[10px] flex items-center justify-center text-[26px] transition-all ${isSel ? "bg-[#dbeafe] ring-2 ring-[#378add]" : "bg-[#f0f0f5]"}`}>
                  {service.icon}
                </div>
                <span className={`text-[13px] leading-[18px] text-center tracking-[-0.08px] whitespace-nowrap ${isSel ? "text-[#378add] font-medium" : "text-black"}`}>
                  {service.label}
                </span>
              </button>
            );
          })}
        </div>
        <button className="w-full h-[53px] bg-[#378add] text-white text-[16px] font-semibold rounded-[12px]">완료</button>
      </div>
    ),
  };

  return (
    <div className="w-[360px] bg-white rounded-t-[20px] border border-[#ebebeb] overflow-hidden">
      <div className="flex justify-center pt-2 pb-1">
        <div className="w-[36px] h-[4px] rounded-full bg-[#ddd]" />
      </div>
      <div className="px-5 pb-5">
        {title && type === "default" && <p className="font-bold text-[16px] text-[#1d1d1f] mt-2 mb-3">{title}</p>}
        {type === "default" ? children : contents[type]}
      </div>
    </div>
  );
}

// ─── SKELETON UI ─────────────────────────────────────────────────────────────
function SkeletonUI({ type = "text" }) {
  const shimmer = "bg-[#e8e8e8] rounded-[6px] animate-pulse";
  if (type === "card") {
    return (
      <div className="bg-white border border-[#ebebeb] rounded-[14px] p-4 w-full">
        <div className={`h-[140px] ${shimmer} rounded-[10px] mb-3`} />
        <div className={`h-[14px] w-3/4 ${shimmer} mb-2`} />
        <div className={`h-[12px] w-1/2 ${shimmer} mb-2`} />
        <div className={`h-[12px] w-1/3 ${shimmer}`} />
      </div>
    );
  }
  if (type === "list") {
    return (
      <div className="flex flex-col gap-0">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-3 px-4 py-3">
            <div className={`w-[40px] h-[40px] rounded-[8px] ${shimmer}`} />
            <div className="flex-1">
              <div className={`h-[14px] w-2/3 ${shimmer} mb-2`} />
              <div className={`h-[11px] w-1/2 ${shimmer}`} />
            </div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2.5 p-4">
      <div className={`h-[14px] w-full ${shimmer}`} />
      <div className={`h-[14px] w-4/5 ${shimmer}`} />
      <div className={`h-[14px] w-3/5 ${shimmer}`} />
    </div>
  );
}

// ─── PROGRESS BAR ────────────────────────────────────────────────────────────
function ProgressBar({ current = 0, max = 100, showPercent = false }) {
  const percent = Math.min(Math.round((current / max) * 100), 100);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-[8px] bg-[#f0f0f0] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#6366f1] rounded-full transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      {showPercent && <span className="text-[12px] font-bold text-[#6366f1] shrink-0">{percent}%</span>}
    </div>
  );
}

// ─── STEPPER ─────────────────────────────────────────────────────────────────
function Stepper({ variant = "generic", steps = [], currentStep = 1, dates }) {
  return (
    <div className="flex flex-col gap-0">
      {steps.map((step, i) => {
        const isCompleted = i + 1 < currentStep;
        const isCurrent = i + 1 === currentStep;
        const isLast = i === steps.length - 1;
        return (
          <div key={i} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={`w-[24px] h-[24px] rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                isCompleted ? "bg-[#6366f1] text-white" :
                isCurrent ? "bg-[#6366f1] text-white ring-4 ring-[rgba(99,102,241,0.15)]" :
                "bg-[#e0e0e0] text-[#aaa]"
              }`}>
                {isCompleted ? "✓" : i + 1}
              </div>
              {!isLast && <div className={`w-[2px] flex-1 min-h-[32px] ${isCompleted ? "bg-[#6366f1]" : "bg-[#e0e0e0]"}`} />}
            </div>
            <div className="pb-6">
              <p className={`text-[13px] font-bold ${isCurrent || isCompleted ? "text-[#1d1d1f]" : "text-[#aaa]"}`}>{step}</p>
              {variant === "mentoring" && dates && dates[i] && (
                <p className="text-[11px] text-[#888] mt-0.5">{dates[i]}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── STATUS BADGE ────────────────────────────────────────────────────────────
function StatusBadge({ type }) {
  const config = {
    "신청완료": { color: "green" }, "신청대기": { color: "amber" }, "종료": { color: "gray" },
    "모집중": { color: "blue" }, "마감": { color: "red" }, "무료": { color: "purple" },
    "보관중": { color: "gray" }, "처리완료": { color: "green" }, "폐기완료": { color: "red" },
    "접수중": { color: "indigo" }, "접수예정": { color: "sky" }, "접수마감": { color: "red" },
  };
  const c = config[type] || { color: "gray" };
  return <Badge text={type} color={c.color} size="md" />;
}

// ─── TOOLTIP ─────────────────────────────────────────────────────────────────
function Tooltip({ content, trigger = "click", direction = "top" }) {
  const [show, setShow] = useState(trigger === "hover" ? false : false);
  const posMap = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };
  const arrowMap = {
    top: "top-full left-1/2 -translate-x-1/2 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-[#1d1d1f]",
    bottom: "bottom-full left-1/2 -translate-x-1/2 border-l-[6px] border-r-[6px] border-b-[6px] border-l-transparent border-r-transparent border-b-[#1d1d1f]",
    left: "left-full top-1/2 -translate-y-1/2 border-t-[6px] border-b-[6px] border-l-[6px] border-t-transparent border-b-transparent border-l-[#1d1d1f]",
    right: "right-full top-1/2 -translate-y-1/2 border-t-[6px] border-b-[6px] border-r-[6px] border-t-transparent border-b-transparent border-r-[#1d1d1f]",
  };
  return (
    <div
      className="relative inline-flex"
      onClick={() => trigger === "click" && setShow(!show)}
      onMouseEnter={() => trigger === "hover" && setShow(true)}
      onMouseLeave={() => trigger === "hover" && setShow(false)}
    >
      <button className="w-[20px] h-[20px] rounded-full bg-[#e8e8e8] text-[#888] text-[11px] font-bold flex items-center justify-center">?</button>
      {show && (
        <div className={`absolute ${posMap[direction]} z-20`}>
          <div className="bg-[#1d1d1f] text-white text-[12px] px-3 py-2 rounded-[8px] whitespace-nowrap relative">
            {content}
            <div className={`absolute w-0 h-0 ${arrowMap[direction]}`} />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── COURSE CARD ─────────────────────────────────────────────────────────────
function CourseCard({ type = "recommended", thumbnail, interestTag, courseName, department, progress, bookmarked = false }) {
  const [isBookmarked, setIsBookmarked] = useState(bookmarked);
  const showProgress = type === "enrolled";
  const showBookmark = type === "recommended" || type === "popular";
  return (
    <div className="bg-white border border-[#ebebeb] rounded-[14px] overflow-hidden w-[200px] shrink-0">
      <div className="relative h-[110px] bg-[#f0f0f5] overflow-hidden">
        {thumbnail ? <img src={thumbnail} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-[32px]">📚</div>}
        {showBookmark && (
          <button onClick={() => setIsBookmarked(!isBookmarked)} className="absolute top-2 right-2 text-[18px]">
            {isBookmarked ? "❤️" : "🤍"}
          </button>
        )}
        {type === "popular" && <span className="absolute top-2 left-2 bg-[#ef4444] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">인기</span>}
        {type === "upcoming" && <span className="absolute top-2 left-2 bg-[#6366f1] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">수강예정</span>}
        {type === "completed" && <span className="absolute top-2 left-2 bg-[#888] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">수강완료</span>}
      </div>
      <div className="p-3">
        {interestTag && <span className="text-[10px] text-[#6366f1] font-bold">{interestTag}</span>}
        <p className="font-bold text-[13px] text-[#1d1d1f] mt-0.5 line-clamp-2 leading-snug">{courseName}</p>
        {department && <p className="text-[11px] text-[#888] mt-1">{department}</p>}
        {showProgress && progress !== undefined && (
          <div className="mt-2">
            <ProgressBar current={progress} max={100} showPercent />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── POST CARD ───────────────────────────────────────────────────────────────
function PostCard({ type = "free", recruitStatus, title, preview, author, createdAt }) {
  const typeLabel = { free: "자유", question: "질문", study: "스터디", review: "수강후기" };
  const typeColor = { free: "gray", question: "indigo", study: "blue", review: "green" };
  return (
    <div className="px-4 py-3.5">
      <div className="flex items-center gap-1.5 mb-1.5">
        <Badge text={typeLabel[type]} color={typeColor[type]} />
        {type === "study" && recruitStatus && (
          <Badge text={recruitStatus} color={recruitStatus === "모집중" ? "green" : "red"} />
        )}
      </div>
      <p className="font-bold text-[14px] text-[#1d1d1f] line-clamp-1">{title}</p>
      {preview && <p className="text-[12px] text-[#888] mt-1 line-clamp-2 leading-snug">{preview}</p>}
      <div className="flex items-center gap-2 mt-2">
        <span className="text-[11px] text-[#aaa]">{author}</span>
        <span className="text-[11px] text-[#ddd]">|</span>
        <span className="text-[11px] text-[#aaa]">{createdAt}</span>
      </div>
    </div>
  );
}

// ─── NOTIFICATION CARD ───────────────────────────────────────────────────────
function NotificationCard({ category, message, receivedAt, isRead = false }) {
  return (
    <div className={`px-4 py-3.5 ${isRead ? "opacity-60" : ""}`}>
      <div className="flex items-start gap-3">
        {!isRead && <div className="w-[6px] h-[6px] rounded-full bg-[#6366f1] mt-1.5 shrink-0" />}
        <div className={`flex-1 ${isRead ? "ml-[18px]" : ""}`}>
          <span className="text-[11px] font-bold text-[#6366f1]">{category}</span>
          <p className="text-[13px] text-[#1d1d1f] mt-0.5 leading-snug">{message}</p>
          <p className="text-[11px] text-[#aaa] mt-1">{receivedAt}</p>
        </div>
      </div>
    </div>
  );
}

// ─── AI ANSWER CARD ──────────────────────────────────────────────────────────
function AIAnswerCard({ questionTitle, answerText, status = "completed" }) {
  return (
    <div className="bg-white border border-[#ebebeb] rounded-[14px] p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[16px]">🤖</span>
        <span className="text-[12px] font-bold text-[#6366f1]">AI 답변</span>
        {status === "loading" && <span className="text-[10px] text-[#888]">답변 생성 중...</span>}
        {status === "no-answer" && <span className="text-[10px] text-[#ef4444]">답변 없음</span>}
      </div>
      <p className="font-bold text-[14px] text-[#1d1d1f] mb-2">{questionTitle}</p>
      {status === "loading" && (
        <div className="flex gap-1 py-3">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-[8px] h-[8px] rounded-full bg-[#6366f1] animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
          ))}
        </div>
      )}
      {status === "completed" && <p className="text-[13px] text-[#555] leading-relaxed">{answerText}</p>}
      {status === "no-answer" && <p className="text-[13px] text-[#aaa]">해당 질문에 대한 답변을 찾을 수 없습니다.</p>}
    </div>
  );
}

// ─── ATTACHMENT (FILE) ───────────────────────────────────────────────────────
function Attachment({ type = "file", fileName, extension, status = "default", showDelete = true }) {
  const icons = { pdf: "📄", doc: "📝", xls: "📊", img: "🖼️", zip: "📦", default: "📎" };
  const extIcon = type === "image" ? icons.img : (icons[extension] || icons.default);
  const statusLabel = { default: "", uploading: "업로드 중...", complete: "완료", error: "오류", downloadable: "다운로드", failed: "실패" };
  const statusColor = { default: "text-[#888]", uploading: "text-[#6366f1]", complete: "text-[#22c55e]", error: "text-[#ef4444]", downloadable: "text-[#1a73e8]", failed: "text-[#ef4444]" };
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 bg-[#f9f9f9] rounded-[10px] border border-[#ebebeb]">
      <span className="text-[20px]">{extIcon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-[#1d1d1f] truncate">{fileName}.{extension}</p>
        {statusLabel[status] && <p className={`text-[11px] mt-0.5 ${statusColor[status]}`}>{statusLabel[status]}</p>}
        {status === "uploading" && (
          <div className="mt-1 h-[3px] bg-[#e8e8e8] rounded-full overflow-hidden">
            <div className="h-full w-2/3 bg-[#6366f1] rounded-full animate-pulse" />
          </div>
        )}
      </div>
      {showDelete && status !== "uploading" && (
        <button className="text-[14px] text-[#aaa] shrink-0">✕</button>
      )}
      {status === "downloadable" && (
        <button className="text-[14px] text-[#1a73e8] shrink-0">⬇</button>
      )}
    </div>
  );
}

// ─── SLIDER ──────────────────────────────────────────────────────────────────
function Slider({ items = [], showIndicator = true, autoPlay = false, autoPlayInterval = 3 }) {
  const [current, setCurrent] = useState(0);
  const goTo = (idx) => setCurrent(Math.max(0, Math.min(idx, items.length - 1)));

  useEffect(() => {
    if (!autoPlay || items.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % items.length);
    }, autoPlayInterval * 1000);
    return () => clearInterval(timer);
  }, [autoPlay, autoPlayInterval, items.length]);
  return (
    <div className="relative w-full overflow-hidden rounded-[14px]">
      <div className="flex transition-transform" style={{ transform: `translateX(-${current * 100}%)` }}>
        {items.map((item, i) => (
          <div key={i} className="w-full shrink-0 h-[180px] bg-[#f0f0f5] flex items-center justify-center">
            {typeof item === "string" ? (
              <img src={item} className="w-full h-full object-cover" alt="" />
            ) : (
              <span className="text-[14px] text-[#888]">{item.label || `Slide ${i + 1}`}</span>
            )}
          </div>
        ))}
      </div>
      {items.length > 1 && (
        <>
          <button onClick={() => goTo(current - 1)} className="absolute left-2 top-1/2 -translate-y-1/2 w-[28px] h-[28px] rounded-full bg-[rgba(0,0,0,0.3)] text-white text-[14px] flex items-center justify-center">‹</button>
          <button onClick={() => goTo(current + 1)} className="absolute right-2 top-1/2 -translate-y-1/2 w-[28px] h-[28px] rounded-full bg-[rgba(0,0,0,0.3)] text-white text-[14px] flex items-center justify-center">›</button>
        </>
      )}
      {showIndicator && items.length > 1 && (
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
          {items.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)} className={`w-[7px] h-[7px] rounded-full transition-colors ${i === current ? "bg-white" : "bg-[rgba(255,255,255,0.4)]"}`} />
          ))}
        </div>
      )}
      {autoPlay && <p className="absolute top-2 right-2 text-[10px] text-white bg-[rgba(0,0,0,0.3)] px-2 py-0.5 rounded-full">자동재생 {autoPlayInterval}s</p>}
    </div>
  );
}

// ─── IMAGE VIEWER ────────────────────────────────────────────────────────────
function ImageViewer({ images = [], swipeable = true }) {
  const [current, setCurrent] = useState(0);
  return (
    <div className="relative bg-[#000] rounded-[14px] overflow-hidden">
      <div className="h-[240px] flex items-center justify-center">
        {images[current] ? (
          <img src={images[current]} className="max-w-full max-h-full object-contain" alt="" />
        ) : (
          <span className="text-[#555]">이미지 없음</span>
        )}
      </div>
      {images.length > 1 && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center items-center gap-2">
          <span className="text-[12px] text-white bg-[rgba(0,0,0,0.5)] px-2 py-0.5 rounded-full">
            {current + 1} / {images.length}
          </span>
        </div>
      )}
      {swipeable && images.length > 1 && (
        <>
          <button onClick={() => setCurrent(Math.max(0, current - 1))} className="absolute left-2 top-1/2 -translate-y-1/2 w-[28px] h-[28px] rounded-full bg-[rgba(255,255,255,0.2)] text-white text-[14px] flex items-center justify-center">‹</button>
          <button onClick={() => setCurrent(Math.min(images.length - 1, current + 1))} className="absolute right-2 top-1/2 -translate-y-1/2 w-[28px] h-[28px] rounded-full bg-[rgba(255,255,255,0.2)] text-white text-[14px] flex items-center justify-center">›</button>
        </>
      )}
    </div>
  );
}

// ─── PROFILE CARD ────────────────────────────────────────────────────────────
function ProfileCard({ avatar, nickname, userId, points, couponCount, showEdit = true }) {
  return (
    <div className="flex items-center gap-4 px-4 py-4">
      <div className="w-[60px] h-[60px] rounded-full bg-[#f0f0f5] overflow-hidden shrink-0 flex items-center justify-center">
        {avatar ? <img src={avatar} className="w-full h-full object-cover" alt="" /> : <span className="text-[28px]">👤</span>}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-[16px] text-[#1d1d1f]">{nickname}</p>
        <p className="text-[12px] text-[#888] mt-0.5">{userId}</p>
        <div className="flex gap-3 mt-1.5">
          {points !== undefined && (
            <span className="text-[11px]"><span className="text-[#aaa]">포인트 </span><span className="text-[#6366f1] font-bold">{points.toLocaleString()}P</span></span>
          )}
          {couponCount !== undefined && (
            <span className="text-[11px]"><span className="text-[#aaa]">쿠폰 </span><span className="text-[#6366f1] font-bold">{couponCount}장</span></span>
          )}
        </div>
      </div>
      {showEdit && (
        <button className="text-[13px] font-medium text-[#6366f1] shrink-0">편집</button>
      )}
    </div>
  );
}

// ─── PROFILE IMAGE UPLOADER ──────────────────────────────────────────────────
function ProfileImageUploader({ status = "default", showDelete = false }) {
  const states = {
    default: { icon: "👤", bg: "bg-[#f0f0f5]" },
    uploading: { icon: "⏳", bg: "bg-[#f0f0f5]" },
    complete: { icon: "✅", bg: "bg-[#e8f5e9]" },
    error: { icon: "⚠️", bg: "bg-[#fce4ec]" },
  };
  const s = states[status] || states.default;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`relative w-[80px] h-[80px] rounded-full ${s.bg} flex items-center justify-center`}>
        <span className="text-[32px]">{s.icon}</span>
        <button className="absolute bottom-0 right-0 w-[24px] h-[24px] rounded-full bg-[#6366f1] text-white text-[12px] flex items-center justify-center shadow">
          📷
        </button>
        {showDelete && status === "complete" && (
          <button className="absolute top-0 right-0 w-[20px] h-[20px] rounded-full bg-[rgba(0,0,0,0.5)] text-white text-[10px] flex items-center justify-center">✕</button>
        )}
      </div>
      {status === "uploading" && <p className="text-[11px] text-[#6366f1]">업로드 중...</p>}
      {status === "error" && <p className="text-[11px] text-[#ef4444]">업로드 실패</p>}
    </div>
  );
}

// ─── SELECTION COUNTER ───────────────────────────────────────────────────────
function SelectionCounter({ current = 0, minimum = 3, status }) {
  const computedStatus = status || (current >= minimum ? "met" : "unmet");
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-[8px] ${computedStatus === "met" ? "bg-[rgba(99,102,241,0.08)]" : "bg-[#f5f5f7]"}`}>
      <span className={`text-[13px] font-bold ${computedStatus === "met" ? "text-[#6366f1]" : "text-[#888]"}`}>
        {current}/{minimum}
      </span>
      <span className={`text-[12px] ${computedStatus === "met" ? "text-[#6366f1]" : "text-[#aaa]"}`}>
        {computedStatus === "met" ? "선택 완료" : `${minimum - current}개 더 선택하세요`}
      </span>
    </div>
  );
}

// ─── ATTENDANCE CALENDAR ─────────────────────────────────────────────────────
function AttendanceCalendar({ data = [], currentMonth }) {
  const [year, month] = currentMonth ? currentMonth.split("-").map(Number) : [2026, 4];
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = new Date(year, month - 1, 1).getDay();
  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  const statusMap = {};
  data.forEach(item => { statusMap[item.date] = item.status; });

  const statusColors = {
    "present": "bg-[#22c55e] text-white",
    "absent": "bg-[#ef4444] text-white",
    "late": "bg-[#f59e0b] text-white",
    "excused": "bg-[#e8f0fe] text-[#1a73e8]",
  };
  const statusEmoji = { "present": "O", "absent": "X", "late": "△", "excused": "~" };

  return (
    <div className="bg-white border border-[#ebebeb] rounded-[14px] p-4">
      <p className="font-bold text-[14px] text-[#1d1d1f] mb-3 text-center">{year}년 {month}월 출결</p>
      <div className="grid grid-cols-7 gap-1 text-center">
        {["일", "월", "화", "수", "목", "금", "토"].map(d => (
          <span key={d} className="text-[10px] text-[#aaa] font-bold py-1">{d}</span>
        ))}
        {days.map((d, i) => {
          const dateStr = d ? `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}` : "";
          const st = statusMap[dateStr];
          return (
            <div key={i} className={`h-[32px] flex items-center justify-center rounded-full text-[11px] font-bold ${st ? statusColors[st] : d ? "text-[#333]" : ""}`}>
              {d ? (st ? statusEmoji[st] : d) : ""}
            </div>
          );
        })}
      </div>
      <div className="flex gap-3 mt-3 justify-center">
        {[{ label: "출석", color: "bg-[#22c55e]" }, { label: "결석", color: "bg-[#ef4444]" }, { label: "지각", color: "bg-[#f59e0b]" }, { label: "사유", color: "bg-[#e8f0fe]" }].map(l => (
          <div key={l.label} className="flex items-center gap-1">
            <div className={`w-[8px] h-[8px] rounded-full ${l.color}`} />
            <span className="text-[10px] text-[#888]">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── STAR RATING ─────────────────────────────────────────────────────────────
function StarRating({ score = 0, readOnly = false, onChange }) {
  const [rating, setRating] = useState(score);
  const [hover, setHover] = useState(0);
  const handleClick = (val) => { if (!readOnly) { setRating(val); onChange?.(val); } };
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          onClick={() => handleClick(star)}
          onMouseEnter={() => !readOnly && setHover(star)}
          onMouseLeave={() => !readOnly && setHover(0)}
          className={`text-[24px] transition-colors ${readOnly ? "cursor-default" : "cursor-pointer"}`}
          disabled={readOnly}
        >
          <span className={star <= (hover || rating) ? "text-[#f59e0b]" : "text-[#ddd]"}>★</span>
        </button>
      ))}
      <span className="ml-1 text-[13px] font-bold text-[#1d1d1f]">{hover || rating}.0</span>
    </div>
  );
}

// ─── CONTEXT MENU ────────────────────────────────────────────────────────────
function ContextMenu({ type = "my-post", isOpen = true }) {
  if (!isOpen) return null;
  const menus = {
    "my-post": [{ icon: "✏️", label: "수정하기" }, { icon: "🗑️", label: "삭제하기", danger: true }],
    "other-post": [{ icon: "🚨", label: "신고하기", danger: true }, { icon: "🔇", label: "이 사용자 차단" }],
    "my-comment": [{ icon: "✏️", label: "수정하기" }, { icon: "🗑️", label: "삭제하기", danger: true }],
    "other-comment": [{ icon: "🚨", label: "신고하기", danger: true }],
    "my-post-other-comment": [{ icon: "🚨", label: "신고하기", danger: true }, { icon: "🗑️", label: "삭제하기", danger: true }],
  };
  const items = menus[type] || menus["my-post"];
  return (
    <div className="bg-white border border-[#ebebeb] rounded-[12px] shadow-lg overflow-hidden w-[160px]">
      {items.map((item, i) => (
        <button
          key={i}
          className={`w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-[#f5f5f7] transition-colors ${
            item.danger ? "text-[#ef4444]" : "text-[#1d1d1f]"
          }`}
        >
          <span className="text-[14px]">{item.icon}</span>
          <span className="text-[13px] font-medium">{item.label}</span>
        </button>
      ))}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [nav, setNav] = useState("CardSlot");
  const [toggleA, setToggleA] = useState(true);
  const [toggleB, setToggleB] = useState(false);

  const sectionGroups = [
    { label: "컨테이너", items: ["CardSlot", "ListItem"] },
    { label: "카드", items: ["AcademyCard", "AIAnswerCard", "ApplicationCard", "ClassCard", "CourseCard", "NotificationCard", "PostCard", "ProfileCard"] },
    { label: "내비게이션", items: ["BottomNavigationBar", "DrawerMenu", "NavBar", "TabBar"] },
    { label: "폼 요소", items: ["Checkbox", "DatePicker", "ImageAttachment", "InputField", "RadioButton", "SearchBar", "SelectField", "TextArea"] },
    { label: "액션", items: ["CTAButton", "FloatingCartButton"] },
    { label: "피드백/오버레이", items: ["BottomSheet", "ContextMenu", "EmptyText", "Modal", "SkeletonUI", "Toast", "Tooltip"] },
    { label: "데이터/시각화", items: ["AttendanceCalendar", "ProgressBar", "StarRating", "StatusBadge", "StepIndicator", "Stepper"] },
    { label: "미디어", items: ["Attachment", "ImageViewer", "Slider"] },
    { label: "기본 요소", items: ["Asset"] },
    { label: "기타", items: ["ProfileImageUploader", "SelectionCounter", "TagChip"] },
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
      {/* Sidebar */}
      <aside className="w-[210px] shrink-0 bg-white border-r border-[#ebebeb] p-4 sticky top-0 h-screen overflow-y-auto">
        <p className="text-[10px] font-bold text-[#aaa] uppercase tracking-widest mb-4">Components</p>
        {sectionGroups.map(group => (
          <div key={group.label} className="mb-3">
            <p className="text-[10px] font-bold text-[#bbb] uppercase tracking-wider px-1 mb-1">{group.label}</p>
            {group.items.map(s => (
              <button
                key={s}
                onClick={() => setNav(s)}
                className={`w-full text-left px-3 py-1.5 rounded-[8px] text-[12px] font-medium mb-0.5 transition-colors ${
                  nav === s ? "bg-[#6366f1] text-white" : "text-[#555] hover:bg-[#f5f5f7]"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        ))}
      </aside>

      {/* Content */}
      <main className="flex-1 p-8 max-w-[860px]">

        {/* ── CardSlot ── */}
        {nav === "CardSlot" && (
          <div>
            <SectionHeader name="CardSlot" tag="Container" />
            <p className="text-[13px] text-[#555] mb-4">아이템을 카드형 또는 리스트형으로 감싸는 컨테이너. <code className="bg-[#f5f5f7] px-1 rounded">mode</code> prop 하나로 레이아웃이 전환됩니다.</p>
            <PropsTable rows={[
              { prop: "mode",     type: '"card" | "list"',   default: '"card"',  desc: "독립 카드 레이아웃 / 그룹 리스트 레이아웃" },
              { prop: "gap",      type: "number",            default: "10",      desc: "card 모드 아이템 간격 (px)" },
              { prop: "title",    type: "string",            default: "—",       desc: "섹션 타이틀" },
              { prop: "badge",    type: '"신규" | "기존"',    default: "—",       desc: "타이틀 옆 뱃지" },
              { prop: "children", type: "ReactNode",         default: "—",       desc: "아이템 목록 (ListItem, ClassCard 등)" },
            ]} />

            <SubHeader label="mode = card (독립 카드)" />
            <div className="w-[360px]">
              <CardSlot mode="card" gap={10} title="ClassCard" badge="신규">
                <ClassCard time="10:00" title="수학 기초반 A" location="강남 본원" lessonType="개인 레슨" date="2026.04.05" totalSeats={8} remainingSeats={3} isToday status="available" />
                <ClassCard time="14:00" title="영어 회화 중급" location="서초 지점" lessonType="그룹 레슨" date="2026.04.05" totalSeats={12} remainingSeats={1} status="available" />
              </CardSlot>
            </div>

            <SubHeader label="mode = list (그룹 리스트)" />
            <div className="w-[360px]">
              <CardSlot mode="list" title="설정" badge="신규">
                <ListItem asset={{ type: "emoji", icon: "👤" }} primary="프로필 편집" right={{ type: "arrow" }} clickable />
                <ListItem asset={{ type: "emoji", icon: "🔔" }} primary="알림 설정" secondary="수강 알림, 커뮤니티 알림" right={{ type: "toggle", checked: toggleA, onChange: setToggleA }} />
                <ListItem asset={{ type: "emoji", icon: "📎" }} primary="첨부파일" secondary="이미지 2개" right={{ type: "badge", badge: { text: "신청완료", color: "green" } }} />
              </CardSlot>
            </div>
          </div>
        )}

        {/* ── ListItem ── */}
        {nav === "ListItem" && (
          <div>
            <SectionHeader name="ListItem" tag="신규" />
            <p className="text-[13px] text-[#555] mb-4">
              범용 리스트 셀 — <strong>좌측 에셋 + 1~3줄 텍스트 + 우측 요소 + 상태</strong>로 구성됩니다.
              메뉴·설정·알림·수강 정보 등 모든 행 패턴에 재사용하세요.
            </p>
            <PropsTable rows={[
              { prop: "asset (에셋)",               type: "Object",               default: "—",       desc: "좌측 시각 요소. { type, src, icon, size, shape, background } — Asset 컴포넌트 props와 동일" },
              { prop: "primary (메인 텍스트)",       type: "string | TextObject",  default: "—",       desc: "1번째 줄. 가장 중요한 정보" },
              { prop: "secondary (서브 텍스트)",     type: "string | TextObject",  default: "—",       desc: "2번째 줄. 부가 설명" },
              { prop: "tertiary (보조 텍스트)",      type: "string | TextObject",  default: "—",       desc: "3번째 줄. 날짜·상태·추가 정보" },
              { prop: "right (우측 요소)",           type: "{ type, ...payload }", default: "—",       desc: "none | arrow | badge | text | toggle | button | menu | custom" },
              { prop: "clickable (클릭 가능 여부)",  type: "boolean",              default: "false",   desc: "커서·hover 효과 활성화. onClick 지정 시 자동 활성" },
              { prop: "disabled (비활성 상태)",      type: "boolean",              default: "false",   desc: "opacity 감소 + 클릭 비활성" },
              { prop: "restricted (접근 제한 상태)", type: "boolean",              default: "false",   desc: "수강생 전용 등 제한 행 스타일 (opacity 55%)" },
              { prop: "selected (선택 상태)",        type: "boolean",              default: "false",   desc: "배경 인디고 하이라이트" },
              { prop: "align (정렬)",                type: '"start" | "center"',   default: '"start"', desc: "에셋·우측 요소 세로 정렬" },
              { prop: "paddingY (상하 여백)",        type: "string",               default: '"py-3"',  desc: "Tailwind 상하 패딩 클래스" },
              { prop: "onClick",                    type: "Function",              default: "—",       desc: "행 전체 클릭 핸들러" },
            ]} />
            <div className="text-[11px] text-[#888] mb-6 -mt-4 flex flex-col gap-1">
              <p><strong>TextObject</strong>: text · size(xs/sm/md/lg/xl) · weight(normal/medium/bold) · color(hex) · truncate(bool) · lines(number)</p>
              <p><strong>right.type</strong>: arrow · badge(+badge&#123;text,color&#125;) · text(+text,color) · toggle(+checked,onChange) · button(+label,variant,size) · menu · custom(+content)</p>
            </div>

            <SubHeader label="right = arrow (메뉴·설정 리스트)" />
            <div className="w-[360px]">
              <CardSlot mode="list">
                <ListItem asset={{ type: "emoji", icon: "👤" }} primary="프로필 편집" right={{ type: "arrow" }} clickable />
                <ListItem asset={{ type: "emoji", icon: "🏫" }} primary="학원 정보" secondary="강남 프라임 학원" right={{ type: "arrow" }} clickable />
                <ListItem asset={{ type: "emoji", icon: "🔒" }} primary="비밀번호 변경" right={{ type: "arrow" }} clickable />
              </CardSlot>
            </div>

            <SubHeader label="right = toggle (설정 리스트)" />
            <div className="w-[360px]">
              <CardSlot mode="list">
                <ListItem asset={{ type: "emoji", icon: "🔔" }} primary="알림 설정" secondary="수강 알림, 커뮤니티 알림" right={{ type: "toggle", checked: toggleA, onChange: setToggleA }} />
                <ListItem asset={{ type: "emoji", icon: "🌙" }} primary="다크모드" right={{ type: "toggle", checked: toggleB, onChange: setToggleB }} />
              </CardSlot>
            </div>

            <SubHeader label="right = badge (상태 뱃지 row — 수강 신청 현황)" />
            <div className="w-[360px]">
              <CardSlot mode="list">
                <ListItem asset={{ type: "emoji", icon: "📋" }} primary="수학 기초반 A" secondary="강남 본원 · 개인 레슨" tertiary="2026.04.05 · 10:00" right={{ type: "badge", badge: { text: "신청완료", color: "green" } }} />
                <ListItem asset={{ type: "emoji", icon: "📋" }} primary="영어 회화 중급" secondary="서초 지점 · 그룹 레슨" tertiary="2026.04.06 · 14:00" right={{ type: "badge", badge: { text: "대기중", color: "amber" } }} />
                <ListItem asset={{ type: "emoji", icon: "📋" }} primary="과학 탐구반" secondary="분당 지점 · 그룹 레슨" tertiary="2026.04.07 · 09:00" right={{ type: "badge", badge: { text: "취소됨", color: "red" } }} />
              </CardSlot>
            </div>

            <SubHeader label="right = text (우측 텍스트 정보)" />
            <div className="w-[360px]">
              <CardSlot mode="list">
                <ListItem asset={{ type: "emoji", icon: "🎫" }} primary="보유 쿠폰" right={{ type: "text", text: "3장", color: "#6366f1" }} clickable />
                <ListItem asset={{ type: "emoji", icon: "⭐" }} primary="포인트" right={{ type: "text", text: "12,400P", color: "#6366f1" }} clickable />
              </CardSlot>
            </div>

            <SubHeader label="disabled / restricted / selected 상태" />
            <div className="w-[360px]">
              <CardSlot mode="list">
                <ListItem asset={{ type: "emoji", icon: "📚" }} primary="수강 신청" secondary="정상 상태" right={{ type: "arrow" }} clickable />
                <ListItem asset={{ type: "emoji", icon: "🚫" }} primary="결제 내역" secondary="비활성 상태" right={{ type: "arrow" }} disabled />
                <ListItem asset={{ type: "emoji", icon: "🔐" }} primary="학원 생활" secondary="수강생 전용 — 접근 제한" right={{ type: "arrow" }} restricted />
                <ListItem asset={{ type: "emoji", icon: "✅" }} primary="알림 설정" secondary="선택된 상태" right={{ type: "arrow" }} selected clickable />
              </CardSlot>
            </div>

            <SubHeader label="asset = avatar + 프로필 요약 row" />
            <div className="w-[360px]">
              <CardSlot mode="list">
                <ListItem
                  asset={{ type: "avatar", size: "md", shape: "circle" }}
                  primary={{ text: "홍길동", size: "lg", weight: "bold" }}
                  secondary="hong@email.com"
                  tertiary="포인트 12,400P · 쿠폰 3장"
                  right={{ type: "arrow" }}
                  clickable
                />
              </CardSlot>
            </div>

            <SubHeader label="수강 정보 리스트 (3줄 텍스트 + 이모지 에셋)" />
            <div className="w-[360px]">
              <CardSlot mode="list">
                <ListItem
                  asset={{ type: "emoji", icon: "💻", size: "lg" }}
                  primary={{ text: "파이썬 기초 완성반", size: "lg", weight: "bold" }}
                  secondary="강남 IT 아카데미 · 1관 302호"
                  tertiary="매주 화·목 19:00 ~ 21:00"
                  right={{ type: "arrow" }}
                  clickable
                />
                <ListItem
                  asset={{ type: "emoji", icon: "🎨", size: "lg" }}
                  primary={{ text: "포토샵 디자인 기초", size: "lg", weight: "bold" }}
                  secondary="강남 IT 아카데미 · 2관 201호"
                  tertiary="매주 월·수 10:00 ~ 12:00"
                  right={{ type: "badge", badge: { text: "신청완료", color: "green" } }}
                />
              </CardSlot>
            </div>
          </div>
        )}

        {/* ── ClassCard ── */}
        {nav === "ClassCard" && (
          <div>
            <SectionHeader name="ClassCard" tag="신규" />
            <p className="text-[13px] text-[#555] mb-4">수업 일정 카드. CardSlot mode="card" 안에서 사용하며 status prop으로 버튼 상태가 결정됩니다.</p>
            <PropsTable rows={[
              { prop: "time",           type: "string",                          default: "—",         desc: "수업 시작 시간" },
              { prop: "title",          type: "string",                          default: "—",         desc: "반 이름" },
              { prop: "location",       type: "string",                          default: "—",         desc: "지점명" },
              { prop: "lessonType",     type: '"개인 레슨" | "그룹 레슨"',        default: "—",         desc: "수업 유형" },
              { prop: "date",           type: "string",                          default: "—",         desc: "날짜 (YYYY.MM.DD)" },
              { prop: "totalSeats",     type: "number",                          default: "—",         desc: "전체 정원" },
              { prop: "remainingSeats", type: "number",                          default: "—",         desc: "잔여석" },
              { prop: "waitingCount",   type: "number",                          default: "—",         desc: "대기자 수 (선택)" },
              { prop: "myWaitingPos",   type: "number",                          default: "—",         desc: "내 대기 순번 (선택)" },
              { prop: "isToday",        type: "boolean",                         default: "false",     desc: "오늘 뱃지 표시" },
              { prop: "status",         type: '"available" | "waitlist" | "closed"', default: '"available"', desc: "신청 버튼 상태" },
            ]} />

            <SubHeader label='status = "available" (잔여석 있음)' />
            <div className="w-[360px]">
              <CardSlot mode="card">
                <ClassCard time="10:00" title="수학 기초반 A" location="강남 본원" lessonType="개인 레슨" date="2026.04.05" totalSeats={8} remainingSeats={3} isToday status="available" />
              </CardSlot>
            </div>

            <SubHeader label='status = "waitlist" (대기 신청)' />
            <div className="w-[360px]">
              <CardSlot mode="card">
                <ClassCard time="16:30" title="수학 심화반 B" location="강남 본원" lessonType="그룹 레슨" date="2026.04.06" totalSeats={10} remainingSeats={0} waitingCount={5} myWaitingPos={3} status="waitlist" />
              </CardSlot>
            </div>

            <SubHeader label='status = "closed" (마감)' />
            <div className="w-[360px]">
              <CardSlot mode="card">
                <ClassCard time="09:00" title="과학 탐구반" location="분당 지점" lessonType="그룹 레슨" date="2026.04.07" totalSeats={15} remainingSeats={0} status="closed" />
              </CardSlot>
            </div>

            <SubHeader label="mode=list 그룹 사용 예시" />
            <div className="w-[360px]">
              <CardSlot mode="list">
                <ClassCard time="10:00" title="수학 기초반 A" location="강남 본원" lessonType="개인 레슨" date="2026.04.05" totalSeats={8} remainingSeats={3} isToday status="available" />
                <ClassCard time="14:00" title="영어 회화 중급" location="서초 지점" lessonType="그룹 레슨" date="2026.04.05" totalSeats={12} remainingSeats={1} status="available" />
                <ClassCard time="09:00" title="과학 탐구반" location="분당 지점" lessonType="그룹 레슨" date="2026.04.07" totalSeats={15} remainingSeats={0} status="closed" />
              </CardSlot>
            </div>
          </div>
        )}

        {/* ── ApplicationCard ── */}
        {nav === "ApplicationCard" && (
          <div>
            <SectionHeader name="ApplicationCard" tag="신규" />
            <p className="text-[13px] text-[#555] mb-4">수강 신청 현황 카드. status로 뱃지 색상이 자동 결정되며, ctaLabel이 없으면 버튼을 숨깁니다.</p>
            <PropsTable rows={[
              { prop: "academyName",  type: "string",                          default: "—",      desc: "학원명" },
              { prop: "className",    type: "string",                          default: "—",      desc: "수업명" },
              { prop: "schedule",     type: "string",                          default: "—",      desc: "일정 텍스트 (📅 자동 삽입)" },
              { prop: "status",       type: '"신청완료" | "대기중" | "취소됨"',  default: "—",      desc: "상태 (뱃지 색상 자동)" },
              { prop: "showMoreMenu", type: "boolean",                         default: "true",   desc: "⋯ 더보기 메뉴 표시 (취소됨 상태는 자동 숨김)" },
              { prop: "ctaLabel",     type: "string",                          default: "—",      desc: "하단 버튼 텍스트 (없으면 버튼 숨김)" },
              { prop: "ctaVariant",   type: '"primary" | "ghost"',             default: '"primary"', desc: "버튼 색상 스타일" },
            ]} />

            <SubHeader label='status = "신청완료" + ctaLabel' />
            <div className="w-[360px]">
              <CardSlot mode="card">
                <ApplicationCard academyName="강남 프라임 학원" className="수학 기초반 A (그룹 레슨)" schedule="2026.04.05 ~ 2026.06.28 · 매주 월·수" status="신청완료" ctaLabel="수업 상세 보기" />
              </CardSlot>
            </div>

            <SubHeader label='status = "대기중" + ctaVariant="primary"' />
            <div className="w-[360px]">
              <CardSlot mode="card">
                <ApplicationCard academyName="서초 영어 아카데미" className="영어 회화 중급반" schedule="2026.04.10 · 14:00" status="대기중" ctaLabel="대기 취소" />
              </CardSlot>
            </div>

            <SubHeader label='status = "취소됨" (버튼 없음, ⋯ 숨김)' />
            <div className="w-[360px]">
              <CardSlot mode="card">
                <ApplicationCard academyName="분당 코딩 학원" className="파이썬 기초반" schedule="2026.03.01 ~ 2026.03.31" status="취소됨" />
              </CardSlot>
            </div>

            <SubHeader label="전체 3종 리스트 조합" />
            <div className="w-[360px] flex flex-col gap-2.5">
              <div className={tokens.card}><ApplicationCard academyName="강남 프라임 학원" className="수학 기초반 A (그룹 레슨)" schedule="2026.04.05 ~ 2026.06.28 · 매주 월·수" status="신청완료" ctaLabel="수업 상세 보기" /></div>
              <div className={tokens.card}><ApplicationCard academyName="서초 영어 아카데미" className="영어 회화 중급반" schedule="2026.04.10 · 14:00" status="대기중" ctaLabel="대기 취소" /></div>
              <div className={tokens.card}><ApplicationCard academyName="분당 코딩 학원" className="파이썬 기초반" schedule="2026.03.01 ~ 2026.03.31" status="취소됨" /></div>
            </div>
          </div>
        )}

        {/* ── AcademyCard ── */}
        {nav === "AcademyCard" && (
          <div>
            <SectionHeader name="AcademyCard" tag="신규" />
            <p className="text-[13px] text-[#555] mb-4">등록된 학원 목록 행. <strong>ListItem 기반 베리에이션</strong>으로 내부적으로 ListItem을 사용합니다. CardSlot mode="list" 또는 mode="card" 안에서 사용합니다.</p>
            <PropsTable rows={[
              { prop: "icon",              type: "string",   default: "—", desc: "이모지 아이콘 → ListItem icon" },
              { prop: "category",          type: "string",   default: "—", desc: "과목 카테고리 → ListItem label" },
              { prop: "academyName",       type: "string",   default: "—", desc: "학원명 + 지점명 → ListItem description" },
              { prop: "registeredDate",    type: "string",   default: "—", desc: "등록일 → ListItem meta" },
              { prop: "applicationNumber", type: "string",   default: "—", desc: "원서번호 → ListItem meta" },
              { prop: "onClick",           type: "Function", default: "—", desc: "클릭 핸들러 → ListItem onClick" },
            ]} />

            <SubHeader label="단독 카드" />
            <div className="w-[360px]">
              <CardSlot mode="card">
                <AcademyCard icon="🏫" category="IT 계열 · 코딩" academyName="강남 프라임 학원 강남 본원" registeredDate="2024.09.01" applicationNumber="A2024-00291" />
              </CardSlot>
            </div>

            <SubHeader label="mode=list 그룹 (2개)" />
            <div className="w-[360px]">
              <CardSlot mode="list">
                <AcademyCard icon="🏫" category="IT 계열 · 코딩" academyName="강남 프라임 학원 강남 본원" registeredDate="2024.09.01" applicationNumber="A2024-00291" />
                <AcademyCard icon="📚" category="수학 / 과학" academyName="분당 영재 아카데미 분당 본원" registeredDate="2023.03.15" applicationNumber="A2023-00134" />
              </CardSlot>
            </div>
          </div>
        )}

        {/* ── Asset ── */}
        {nav === "Asset" && (
          <div>
            <SectionHeader name="Asset" tag="신규" />
            <p className="text-[13px] text-[#555] mb-4">
              아이콘·이모지·이미지·아바타를 일관된 규격으로 표시하는 <strong>기본 UI 컴포넌트</strong>.
              Badge·Toggle처럼 다른 컴포넌트(DrawerMenu, ListItem 등) 내부에서 재사용되거나 단독으로 사용됩니다.
            </p>
            <PropsTable rows={[
              { prop: "type",       type: '"icon" | "emoji" | "image" | "avatar"',     default: '"emoji"',   desc: "렌더 방식 결정 — src 유무·기본 폴백 동작이 달라짐" },
              { prop: "src",        type: "string",                                     default: "—",         desc: "이미지/아바타 URL" },
              { prop: "icon",       type: "string",                                     default: "—",         desc: "아이콘 문자 또는 이모지 (icon/emoji type)" },
              { prop: "alt",        type: "string",                                     default: '""',        desc: "이미지 대체 텍스트" },
              { prop: "size",       type: 'number | "sm" | "md" | "lg" | "xl"',        default: '"md"',      desc: "sm=28 / md=40 / lg=52 / xl=72 / 직접 px 입력" },
              { prop: "shape",      type: '"circle" | "square" | "rounded"',            default: '"rounded"', desc: "외형 — circle: 원형 / square: 직각 / rounded: 모서리 둥근 사각" },
              { prop: "background", type: "string",                                     default: "type별 자동", desc: "배경색 (CSS color 또는 Tailwind arbitrary)" },
            ]} />

            <SubHeader label="type — 4종 비교" />
            <div className="flex items-end gap-4 flex-wrap">
              {[
                { type: "emoji",  icon: "🏠", label: "emoji" },
                { type: "icon",   icon: "★",  label: "icon" },
                { type: "avatar", src: "",     label: "avatar (no src)" },
                { type: "image",  src: "https://picsum.photos/seed/x1/80", label: "image" },
              ].map(({ type, icon, src, label }) => (
                <div key={label} className="flex flex-col items-center gap-1.5">
                  <Asset type={type} icon={icon} src={src} size="lg" />
                  <span className="text-[10px] text-[#888]">{label}</span>
                </div>
              ))}
            </div>

            <SubHeader label="size — 5단계" />
            <div className="flex items-end gap-4 flex-wrap">
              {["sm", "md", "lg", "xl", 96].map(s => (
                <div key={s} className="flex flex-col items-center gap-1.5">
                  <Asset type="emoji" icon="🎓" size={s} />
                  <span className="text-[10px] text-[#888]">{s}</span>
                </div>
              ))}
            </div>

            <SubHeader label="shape — 3종" />
            <div className="flex items-center gap-4">
              {["rounded", "circle", "square"].map(sh => (
                <div key={sh} className="flex flex-col items-center gap-1.5">
                  <Asset type="emoji" icon="📚" size="lg" shape={sh} />
                  <span className="text-[10px] text-[#888]">{sh}</span>
                </div>
              ))}
            </div>

            <SubHeader label="avatar — src 있음 / 없음" />
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center gap-1.5">
                <Asset type="avatar" src="https://picsum.photos/seed/av1/80" size="lg" shape="circle" />
                <span className="text-[10px] text-[#888]">src 있음</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <Asset type="avatar" size="lg" shape="circle" />
                <span className="text-[10px] text-[#888]">src 없음 (폴백)</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <Asset type="avatar" size="xl" shape="circle" background="#e8e0ff" />
                <span className="text-[10px] text-[#888]">background 커스텀</span>
              </div>
            </div>

            <SubHeader label="background 커스텀" />
            <div className="flex items-center gap-3 flex-wrap">
              {["#fce4ec", "#e8f5e9", "#e8f0fe", "#fff8e1", "#f3e5f5"].map(bg => (
                <Asset key={bg} type="emoji" icon="⭐" size="md" background={bg} />
              ))}
            </div>

            <SubHeader label="type=icon — UI 아이콘 예시 (⋯ more 포함)" />
            <div className="flex items-center gap-4 flex-wrap">
              {[
                { icon: "⋯", label: "more" },
                { icon: "✕", label: "close" },
                { icon: "★", label: "star" },
                { icon: "⚙️", label: "setting" },
                { icon: "🔍", label: "search" },
              ].map(({ icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1.5">
                  <Asset type="icon" icon={icon} size="sm" shape="circle" background="#f5f5f7" />
                  <span className="text-[10px] text-[#888]">{label}</span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-[#aaa] mt-1 mb-4">※ MoreButton(⋯)은 Asset type="icon" icon="⋯" size=&#123;32&#125; shape="circle"으로 대체. background="transparent"로 투명 배경 적용 가능.</p>

            <SubHeader label="다른 컴포넌트 내 사용 예 — ListItem 아이콘 슬롯" />
            <div className="w-[360px]">
              <CardSlot mode="list">
                <ListItem icon="👤" label="프로필 편집" action="arrow" />
                <ListItem icon="🔔" iconSize={40} label="알림 설정" description="수강 알림, 커뮤니티 알림" action="toggle" actionProps={{ checked: false, onChange: () => {} }} />
              </CardSlot>
            </div>
            <p className="text-[11px] text-[#aaa] mt-2">※ ListItem은 내부적으로 Asset과 동일한 규격(size=iconSize, shape=rounded)을 사용합니다.</p>
          </div>
        )}

        {/* ── NavBar ── */}
        {nav === "NavBar" && (
          <div>
            <SectionHeader name="NavBar" tag="병합" />
            <p className="text-[13px] text-[#555] mb-4">
              GlobalHeader + TopBar 통합 컴포넌트. <code className="bg-[#f5f5f7] px-1 rounded">variant="global"</code>은 홈 화면 헤더(로고+알림+메뉴),{" "}
              <code className="bg-[#f5f5f7] px-1 rounded">variant="page"</code>는 내부 페이지 헤더(좌측아이콘+타이틀+우측아이콘)입니다.
            </p>
            <PropsTable rows={[
              { prop: "variant",               type: '"global" | "page"',              default: '"page"',  desc: "헤더 유형" },
              { prop: "title",                 type: "string",                          default: '""',      desc: "중앙 타이틀 (page)" },
              { prop: "leftIcon",              type: '"back" | "close" | "none"',       default: '"back"',  desc: "좌측 아이콘 (page)" },
              { prop: "rightIcon1",            type: "string",                          default: "—",       desc: "우측 아이콘1 (page): search/share/setting/more/alarm" },
              { prop: "rightIcon2",            type: "string",                          default: "—",       desc: "우측 아이콘2 (page)" },
              { prop: "notificationCount",     type: "number",                          default: "0",       desc: "알림 숫자 뱃지 (page, rightIcon1=alarm 일 때)" },
              { prop: "logoClickable",         type: "boolean",                         default: "true",    desc: "로고 클릭 가능 여부 (global)" },
              { prop: "showNotification",      type: "boolean",                         default: "true",    desc: "알림 아이콘 노출 (global)" },
              { prop: "showNotificationBadge", type: "boolean",                         default: "false",   desc: "알림 빨간 점 뱃지 (global)" },
              { prop: "showMenu",              type: "boolean",                         default: "true",    desc: "전체메뉴 아이콘 노출 (global)" },
            ]} />

            <SubHeader label='variant = "global" — 기본 (알림뱃지 있음)' />
            <div className="w-[360px] rounded-[14px] overflow-hidden border border-[#ebebeb]">
              <NavBar variant="global" showNotificationBadge />
            </div>

            <SubHeader label='variant = "global" — 알림뱃지 없음' />
            <div className="w-[360px] rounded-[14px] overflow-hidden border border-[#ebebeb]">
              <NavBar variant="global" />
            </div>

            <SubHeader label='variant = "global" — 로고만 (비클릭)' />
            <div className="w-[360px] rounded-[14px] overflow-hidden border border-[#ebebeb]">
              <NavBar variant="global" logoClickable={false} showNotification={false} showMenu={false} />
            </div>

            <SubHeader label='variant = "page" — 뒤로가기 + 타이틀' />
            <div className="w-[360px] rounded-[14px] overflow-hidden border border-[#ebebeb]">
              <NavBar title="수업 상세" leftIcon="back" />
            </div>

            <SubHeader label='variant = "page" — 타이틀 + 검색 + 더보기' />
            <div className="w-[360px] rounded-[14px] overflow-hidden border border-[#ebebeb]">
              <NavBar title="커뮤니티" leftIcon="back" rightIcon1="search" rightIcon2="more" />
            </div>

            <SubHeader label='variant = "page" — 닫기 + 타이틀' />
            <div className="w-[360px] rounded-[14px] overflow-hidden border border-[#ebebeb]">
              <NavBar title="수강 신청" leftIcon="close" />
            </div>

            <SubHeader label='variant = "page" — 알림 아이콘 + 숫자 뱃지' />
            <div className="w-[360px] rounded-[14px] overflow-hidden border border-[#ebebeb]">
              <NavBar title="알림" leftIcon="back" rightIcon1="alarm" notificationCount={3} />
            </div>
          </div>
        )}

        {/* ── CTAButton ── */}
        {nav === "CTAButton" && (
          <div>
            <SectionHeader name="CTAButton" tag="신규" />
            <p className="text-[13px] text-[#555] mb-4">variant · size · state · fullWidth 조합으로 모든 버튼 상황을 커버하는 최소 범용 버튼. ListItem right 영역에서도 재사용됩니다.</p>
            <PropsTable rows={[
              { prop: "label (버튼 텍스트)",   type: "string",                                          default: "—",         desc: "버튼에 표시될 텍스트" },
              { prop: "variant (버튼 유형)",   type: '"primary"|"secondary"|"ghost"|"danger"|"text"',   default: '"primary"', desc: "primary=주요 / secondary=보조 / ghost=외곽선 / danger=위험 / text=텍스트" },
              { prop: "size (버튼 크기)",      type: '"sm"|"md"|"lg"',                                  default: '"md"',      desc: "sm=32px / md=42px / lg=52px" },
              { prop: "state (버튼 상태)",     type: '"default"|"pressed"|"disabled"|"loading"',        default: '"default"', desc: "default=기본 / pressed=눌림(스타일만) / disabled=비활성 / loading=로딩(클릭불가)" },
              { prop: "fullWidth (전체 너비)", type: "boolean",                                         default: "false",     desc: "true=100% 너비 / false=inline(내용만큼)" },
              { prop: "onClick",              type: "Function",                                        default: "—",         desc: "클릭 핸들러" },
            ]} />

            <SubHeader label="variant 전체 (size=md, state=default)" />
            <div className="flex flex-wrap gap-2">
              {["primary", "secondary", "ghost", "danger", "text"].map(v => (
                <CTAButton key={v} label={v} variant={v} />
              ))}
            </div>

            <SubHeader label="size 전체 (variant=primary)" />
            <div className="flex flex-wrap items-center gap-2">
              {["sm", "md", "lg"].map(s => (
                <CTAButton key={s} label={s} size={s} />
              ))}
            </div>

            <SubHeader label="state 전체 (variant=primary)" />
            <div className="flex flex-wrap items-center gap-3">
              <CTAButton label="default" state="default" />
              <CTAButton label="pressed" state="pressed" />
              <CTAButton label="disabled" state="disabled" />
              <CTAButton label="loading" state="loading" />
            </div>

            <SubHeader label="state = disabled (variant별)" />
            <div className="flex flex-wrap gap-2">
              {["primary", "secondary", "ghost", "danger", "text"].map(v => (
                <CTAButton key={v} label={v} variant={v} state="disabled" />
              ))}
            </div>

            <SubHeader label="state = loading (variant별)" />
            <div className="flex flex-wrap gap-2">
              {["primary", "secondary", "ghost"].map(v => (
                <CTAButton key={v} label={v} variant={v} state="loading" />
              ))}
            </div>

            <SubHeader label="fullWidth" />
            <div className="w-[360px] flex flex-col gap-2">
              <CTAButton label="수강 신청하기" fullWidth />
              <CTAButton label="대기 신청" variant="secondary" fullWidth />
            </div>

            <SubHeader label="ListItem 내부 button 케이스" />
            <div className="w-[360px]">
              <CardSlot mode="list">
                <ListItem
                  asset={{ type: "emoji", icon: "📚" }}
                  primary="수학 기초반 A"
                  secondary="강남 본원 · 개인 레슨"
                  right={{ type: "button", button: { label: "신청하기", variant: "primary", size: "sm", state: "default" } }}
                />
                <ListItem
                  asset={{ type: "emoji", icon: "📋" }}
                  primary="영어 회화 중급"
                  secondary="서초 지점 · 그룹 레슨"
                  right={{ type: "button", button: { label: "대기 신청", variant: "secondary", size: "sm" } }}
                />
                <ListItem
                  asset={{ type: "emoji", icon: "🚫" }}
                  primary="과학 탐구반"
                  secondary="분당 지점 — 마감"
                  right={{ type: "button", button: { label: "마감", variant: "ghost", size: "sm", state: "disabled" } }}
                />
              </CardSlot>
            </div>
          </div>
        )}

        {/* ── InputField ── */}
        {nav === "InputField" && (
          <div>
            <SectionHeader name="InputField" tag="신규" />
            <p className="text-[13px] text-[#555] mb-4">단일 행 텍스트 입력. label·hint·error·disabled 조합으로 폼 내 모든 입력 상태를 표현합니다.</p>
            <PropsTable rows={[
              { prop: "label",       type: "string",  default: "—",      desc: "입력 레이블" },
              { prop: "value",       type: "string",  default: "—",      desc: "입력 기본값" },
              { prop: "placeholder", type: "string",  default: "—",      desc: "플레이스홀더" },
              { prop: "hint",        type: "string",  default: "—",      desc: "하단 안내 텍스트" },
              { prop: "error",       type: "string",  default: "—",      desc: "에러 메시지 (있으면 빨간 테두리)" },
              { prop: "disabled",    type: "boolean", default: "false",  desc: "비활성화" },
              { prop: "type",        type: "string",  default: '"text"', desc: "input type 속성" },
            ]} />
            <div className="w-[360px] flex flex-col gap-4">
              <SubHeader label="기본" />
              <InputField label="이름" placeholder="이름을 입력하세요" hint="실명으로 입력해주세요" />
              <SubHeader label="값 입력됨" />
              <InputField label="이메일" value="hello@example.com" />
              <SubHeader label="에러" />
              <InputField label="전화번호" value="010-0000" error="올바른 전화번호 형식이 아닙니다" />
              <SubHeader label="비활성" />
              <InputField label="아이디" value="user_001" disabled />
            </div>
          </div>
        )}

        {/* ── TextArea ── */}
        {nav === "TextArea" && (
          <div>
            <SectionHeader name="TextArea" tag="신규" />
            <p className="text-[13px] text-[#555] mb-4">여러 줄 텍스트 입력. InputField와 동일한 상태 구조를 가집니다.</p>
            <PropsTable rows={[
              { prop: "label",       type: "string",  default: "—",     desc: "입력 레이블" },
              { prop: "value",       type: "string",  default: "—",     desc: "입력 기본값" },
              { prop: "placeholder", type: "string",  default: "—",     desc: "플레이스홀더" },
              { prop: "rows",        type: "number",  default: "4",     desc: "기본 행 수" },
              { prop: "hint",        type: "string",  default: "—",     desc: "하단 안내 텍스트" },
              { prop: "error",       type: "string",  default: "—",     desc: "에러 메시지" },
              { prop: "disabled",    type: "boolean", default: "false", desc: "비활성화" },
            ]} />
            <div className="w-[360px] flex flex-col gap-4">
              <SubHeader label="기본" />
              <TextArea label="문의 내용" placeholder="내용을 입력해주세요" hint="최대 500자까지 입력 가능합니다" />
              <SubHeader label="에러" />
              <TextArea label="자기소개" error="내용을 입력해주세요" />
              <SubHeader label="비활성" />
              <TextArea label="비고" value="수정 불가 항목입니다." disabled />
            </div>
          </div>
        )}

        {/* ── ImageAttachment ── */}
        {nav === "ImageAttachment" && (
          <div>
            <SectionHeader name="ImageAttachment" tag="신규" />
            <p className="text-[13px] text-[#555] mb-4">이미지 첨부 컴포넌트. 첨부된 이미지와 추가 버튼을 함께 표시하며 maxCount 초과 시 + 버튼이 사라집니다.</p>
            <PropsTable rows={[
              { prop: "images",   type: "string[]", default: "[]",  desc: "첨부된 이미지 URL 목록" },
              { prop: "maxCount", type: "number",   default: "5",   desc: "최대 첨부 가능 개수" },
              { prop: "disabled", type: "boolean",  default: "false", desc: "비활성화 (삭제 버튼 숨김)" },
            ]} />
            <SubHeader label="빈 상태 (0/5)" />
            <ImageAttachment images={[]} maxCount={5} />
            <SubHeader label="일부 첨부 (2/5)" />
            <ImageAttachment images={["https://picsum.photos/seed/a/72", "https://picsum.photos/seed/b/72"]} maxCount={5} />
            <SubHeader label="비활성" />
            <ImageAttachment images={["https://picsum.photos/seed/c/72"]} disabled />
          </div>
        )}

        {/* ── StepIndicator ── */}
        {nav === "StepIndicator" && (
          <div>
            <SectionHeader name="StepIndicator" tag="신규" />
            <p className="text-[13px] text-[#555] mb-4">단계 진행 표시기. bar(선형)와 dot(점) 두 가지 variant를 제공합니다.</p>
            <PropsTable rows={[
              { prop: "steps",   type: "string[]",      default: "—",     desc: "각 단계 레이블 배열" },
              { prop: "current", type: "number",         default: "—",     desc: "현재 단계 (1-based)" },
              { prop: "variant", type: '"bar" | "dot"', default: '"bar"', desc: "표시 스타일" },
            ]} />
            <SubHeader label='variant="bar" — 1단계' />
            <div className="w-[360px] p-4 bg-white rounded-[14px] border border-[#ebebeb]">
              <StepIndicator steps={["학원 선택", "수업 선택", "신청 완료"]} current={1} />
            </div>
            <SubHeader label='variant="bar" — 2단계' />
            <div className="w-[360px] p-4 bg-white rounded-[14px] border border-[#ebebeb]">
              <StepIndicator steps={["학원 선택", "수업 선택", "신청 완료"]} current={2} />
            </div>
            <SubHeader label='variant="bar" — 완료' />
            <div className="w-[360px] p-4 bg-white rounded-[14px] border border-[#ebebeb]">
              <StepIndicator steps={["학원 선택", "수업 선택", "신청 완료"]} current={3} />
            </div>
            <SubHeader label='variant="dot"' />
            <div className="w-[360px] p-4 bg-white rounded-[14px] border border-[#ebebeb] flex justify-center">
              <StepIndicator steps={["", "", "", ""]} current={2} variant="dot" />
            </div>
          </div>
        )}

        {/* ── EmptyText ── */}
        {nav === "EmptyText" && (
          <div>
            <SectionHeader name="EmptyText" tag="신규" />
            <p className="text-[13px] text-[#555] mb-4">리스트/콘텐츠가 없을 때 표시하는 빈 상태 컴포넌트. ctaLabel이 없으면 버튼을 숨깁니다.</p>
            <PropsTable rows={[
              { prop: "icon",        type: "string",  default: "—",  desc: "이모지 아이콘" },
              { prop: "title",       type: "string",  default: "—",  desc: "메인 타이틀" },
              { prop: "description", type: "string",  default: "—",  desc: "보조 설명 텍스트" },
              { prop: "ctaLabel",    type: "string",  default: "—",  desc: "버튼 텍스트 (없으면 숨김)" },
            ]} />
            <SubHeader label="아이콘 + 설명 + 버튼" />
            <div className="w-[360px] bg-white rounded-[14px] border border-[#ebebeb]">
              <EmptyText icon="📭" title="신청 내역이 없어요" description={"수업을 검색하고\n첫 수강 신청을 해보세요"} ctaLabel="수업 찾아보기" />
            </div>
            <SubHeader label="아이콘 + 설명만" />
            <div className="w-[360px] bg-white rounded-[14px] border border-[#ebebeb]">
              <EmptyText icon="🔔" title="알림이 없어요" description="새로운 소식이 오면 알려드릴게요" />
            </div>
            <SubHeader label="텍스트만" />
            <div className="w-[360px] bg-white rounded-[14px] border border-[#ebebeb]">
              <EmptyText title="검색 결과가 없어요" />
            </div>
          </div>
        )}

        {/* ── Modal ── */}
        {nav === "Modal" && (
          <div>
            <SectionHeader name="Modal" tag="신규" />
            <p className="text-[13px] text-[#555] mb-4">확인/취소 다이얼로그. variant="danger"는 주요 버튼을 빨간색으로 강조합니다. (실제 사용 시 포털로 렌더)</p>
            <PropsTable rows={[
              { prop: "title",           type: "string",              default: "—",         desc: "모달 타이틀" },
              { prop: "description",     type: "string",              default: "—",         desc: "보조 설명" },
              { prop: "primaryLabel",    type: "string",              default: '"확인"',     desc: "주요 버튼 텍스트" },
              { prop: "secondaryLabel",  type: "string",              default: '"취소"',     desc: "보조 버튼 텍스트" },
              { prop: "variant",         type: '"default"|"danger"',  default: '"default"', desc: "버튼 스타일" },
            ]} />
            <SubHeader label='variant="default"' />
            <div className="flex justify-center py-2">
              <Modal title="수강 신청을 완료했어요" description="신청 내역은 마이페이지에서 확인할 수 있어요" primaryLabel="확인" secondaryLabel="취소" />
            </div>
            <SubHeader label='variant="danger"' />
            <div className="flex justify-center py-2">
              <Modal title="신청을 취소할까요?" description="취소 후에는 되돌릴 수 없어요" primaryLabel="취소하기" secondaryLabel="아니요" variant="danger" />
            </div>
            <SubHeader label="설명 없음" />
            <div className="flex justify-center py-2">
              <Modal title="로그아웃 하시겠어요?" primaryLabel="로그아웃" />
            </div>
          </div>
        )}

   
        {/* ── BottomNavigationBar ── */}
        {nav === "BottomNavigationBar" && (
          <div>
            <SectionHeader name="BottomNavigationBar" tag="신규" />
            <p className="text-[13px] text-[#555] mb-4">앱 하단 내비게이션 바. 탭 목록과 활성 탭을 제어합니다.</p>
            <PropsTable rows={[
              { prop: "tabs", type: "string[]", default: '["홈","검색","내 수업","커뮤니티","마이"]', desc: "탭 목록" },
              { prop: "activeTab", type: "string", default: '"홈"', desc: "활성 탭 이름" },
            ]} />
            <SubHeader label='activeTab = "홈"' />
            <div className="w-[360px] rounded-[14px] overflow-hidden border border-[#ebebeb]">
              <BottomNavigationBar tabs={["홈", "검색", "내 수업", "커뮤니티", "마이"]} activeTab="홈" />
            </div>
            <SubHeader label='activeTab = "내 수업"' />
            <div className="w-[360px] rounded-[14px] overflow-hidden border border-[#ebebeb]">
              <BottomNavigationBar tabs={["홈", "검색", "내 수업", "커뮤니티", "마이"]} activeTab="내 수업" />
            </div>
          </div>
        )}

        {/* ── TabBar ── */}
        {nav === "TabBar" && (
          <div>
            <SectionHeader name="TabBar" tag="신규" />
            <p className="text-[13px] text-[#555] mb-4">탭 전환 바. 언더라인 스타일과 세그먼트 스타일을 지원합니다.</p>
            <PropsTable rows={[
              { prop: "tabs", type: "string[]", default: "[]", desc: "탭 목록" },
              { prop: "activeTab", type: "string", default: "—", desc: "활성 탭 이름" },
              { prop: "style", type: '"underline" | "segment"', default: '"underline"', desc: "탭 스타일" },
            ]} />
            <SubHeader label='style = "underline"' />
            <div className="w-[360px] rounded-[14px] overflow-hidden border border-[#ebebeb] bg-white">
              <TabBar tabs={["전체", "수강중", "수강완료"]} activeTab="전체" style="underline" />
            </div>
            <SubHeader label='style = "segment"' />
            <div className="w-[360px] p-3 rounded-[14px] border border-[#ebebeb] bg-white">
              <TabBar tabs={["전체", "수강중", "수강완료"]} activeTab="수강중" style="segment" />
            </div>
          </div>
        )}

        {/* ── DrawerMenu ── */}
        {nav === "DrawerMenu" && (
          <div>
            <SectionHeader name="DrawerMenu" tag="업데이트" />
            <p className="text-[13px] text-[#555] mb-4">
              전체 메뉴 드로어. 사용자 상태 <strong>3가지</strong>(비회원 / 회원·미수강 / 수강생)에 따라 헤더·자주 쓰는 서비스·카테고리 메뉴가 모두 달라집니다.
            </p>
            <PropsTable rows={[
              { prop: "loginState",  type: '"guest" | "nonStudent" | "student"', default: '"guest"', desc: "비회원 / 회원(미수강) / 수강생" },
              { prop: "isOpen",      type: "boolean",                            default: "true",    desc: "드로어 열림 여부" },
              { prop: "_demoToast",  type: "boolean",                            default: "false",   desc: "[문서용] true 시 접근 제한 Toast를 즉시 표시 (클릭 없이 정적 미리보기)" },
            ]} />

            <SubHeader label='loginState = "guest" — 비회원' />
            <p className="text-[12px] text-[#888] mb-3 -mt-2">로그인 유도 CTA · 자주 쓰는 서비스 숨김 · 학원 생활 카테고리 숨김</p>
            <DrawerMenu loginState="guest" isOpen />

            <SubHeader label='loginState = "nonStudent" — 회원(미수강)' />
            <p className="text-[12px] text-[#888] mb-3 -mt-2">프로필 표시 · 자주 쓰는 서비스 5개 타일 · 학원 생활 잠금(클릭 시 Toast)</p>
            <DrawerMenu loginState="nonStudent" isOpen />

            <SubHeader label='loginState = "nonStudent" + _demoToast — 접근 제한 Toast 표시' />
            <p className="text-[12px] text-[#888] mb-3 -mt-2">학원 생활 클릭 시 <code className="bg-[#f5f5f7] px-1 rounded">_demoToast</code>로 정적 미리보기</p>
            <DrawerMenu loginState="nonStudent" isOpen _demoToast />

            <SubHeader label='loginState = "student" — 수강생' />
            <p className="text-[12px] text-[#888] mb-3 -mt-2">프로필 표시 · 자주 쓰는 서비스 5개 타일 · 전체 카테고리 접근 가능</p>
            <DrawerMenu loginState="student" isOpen />
          </div>
        )}

        {/* ── SelectField ── */}
        {nav === "SelectField" && (
          <div>
            <SectionHeader name="SelectField" tag="신규" />
            <p className="text-[13px] text-[#555] mb-4">
              드롭다운 선택 컴포넌트. <code className="bg-[#f5f5f7] px-1 rounded">variant="form"</code>은 레이블 포함 폼 드롭다운 (실제 클릭 시 옵션 열림),{" "}
              <code className="bg-[#f5f5f7] px-1 rounded">variant="inline"</code>은 텍스트 줄 안에 삽입되는 컴팩트형입니다.
            </p>
            <PropsTable rows={[
              { prop: "variant",     type: '"form" | "inline"',                   default: '"form"',    desc: "폼형 / 인라인형" },
              { prop: "label",       type: "string",                               default: "—",         desc: "레이블 (form 타입만)" },
              { prop: "options",     type: "string[]",                             default: "[]",        desc: "옵션 목록 (클릭 시 드롭다운 열림)" },
              { prop: "value",       type: "string",                               default: "—",         desc: "선택된 초기값" },
              { prop: "status",      type: '"default" | "selected" | "disabled"',  default: '"default"', desc: "상태 (selected: 파란 테두리, disabled: 비활성)" },
              { prop: "placeholder", type: "string",                               default: '"선택하세요"', desc: "플레이스홀더" },
              { prop: "error",       type: "string",                               default: "—",         desc: "에러 메시지 (form 타입 / 빨간 테두리 + 하단 텍스트)" },
            ]} />

            <SubHeader label='variant = "form" — 기본 (미선택)' />
            <div className="w-[360px]">
              <SelectField variant="form" label="지점 선택" options={["강남 본원", "서초 지점", "분당 지점"]} placeholder="지점을 선택하세요" />
            </div>

            <SubHeader label='variant = "form" — 선택됨' />
            <div className="w-[360px]">
              <SelectField variant="form" label="지점 선택" options={["강남 본원", "서초 지점", "분당 지점"]} value="강남 본원" status="selected" />
            </div>

            <SubHeader label='variant = "form" — 에러' />
            <div className="w-[360px]">
              <SelectField variant="form" label="수업 선택" error="수업을 선택해주세요" options={[]} />
            </div>

            <SubHeader label='variant = "form" — 비활성' />
            <div className="w-[360px]">
              <SelectField variant="form" label="지점 선택" value="강남 본원" status="disabled" />
            </div>

            <SubHeader label='variant = "inline"' />
            <div className="flex items-center gap-2">
              <span className="text-[13px] text-[#555]">정렬:</span>
              <SelectField variant="inline" options={["최신순", "인기순", "조회순"]} value="최신순" />
            </div>
          </div>
        )}

        {/* ── Checkbox ── */}
        {nav === "Checkbox" && (
          <div>
            <SectionHeader name="Checkbox" tag="신규" />
            <p className="text-[13px] text-[#555] mb-4">체크박스 컴포넌트. 필수/선택/전체동의 구분과 화살표 유무를 지원합니다.</p>
            <PropsTable rows={[
              { prop: "text", type: "string", default: "—", desc: "체크박스 텍스트" },
              { prop: "checked", type: "boolean", default: "false", desc: "선택 여부" },
              { prop: "type", type: '"required" | "optional" | "all"', default: '"optional"', desc: "구분 (필수/선택/전체동의)" },
              { prop: "showArrow", type: "boolean", default: "false", desc: "우측 화살표 표시" },
            ]} />
            <SubHeader label="전체 동의 + 필수/선택 조합" />
            <div className="w-[360px] bg-white rounded-[14px] border border-[#ebebeb] px-4 py-3">
              <Checkbox text="전체 동의" type="all" checked />
              <Checkbox text="이용약관 동의" type="required" showArrow />
              <Checkbox text="개인정보 수집 및 이용 동의" type="required" showArrow />
              <Checkbox text="마케팅 수신 동의" type="optional" showArrow />
            </div>
          </div>
        )}

        {/* ── RadioButton ── */}
        {nav === "RadioButton" && (
          <div>
            <SectionHeader name="RadioButton" tag="신규" />
            <p className="text-[13px] text-[#555] mb-4">라디오 버튼 그룹. 단일 선택을 위한 옵션 목록을 렌더합니다.</p>
            <PropsTable rows={[
              { prop: "options", type: "string[]", default: "[]", desc: "옵션 목록" },
              { prop: "value", type: "string", default: "—", desc: "선택된 값" },
              { prop: "disabled", type: "boolean", default: "false", desc: "비활성 여부" },
            ]} />
            <SubHeader label="활성 상태" />
            <div className="w-[360px] bg-white rounded-[14px] border border-[#ebebeb] p-4">
              <RadioButton options={["개인 레슨", "그룹 레슨", "온라인 수업"]} value="개인 레슨" />
            </div>
            <SubHeader label="비활성 상태" />
            <div className="w-[360px] bg-white rounded-[14px] border border-[#ebebeb] p-4">
              <RadioButton options={["개인 레슨", "그룹 레슨"]} value="개인 레슨" disabled />
            </div>
          </div>
        )}

        {/* ── SearchBar ── */}
        {nav === "SearchBar" && (
          <div>
            <SectionHeader name="SearchBar" tag="신규" />
            <p className="text-[13px] text-[#555] mb-4">검색 입력 바. 입력값이 있으면 X 버튼으로 초기화 가능합니다.</p>
            <PropsTable rows={[
              { prop: "placeholder", type: "string", default: '"검색어를 입력하세요"', desc: "플레이스홀더" },
              { prop: "value", type: "string", default: '""', desc: "초기 입력값" },
            ]} />
            <SubHeader label="빈 상태" />
            <div className="w-[360px]">
              <SearchBar placeholder="수업명 또는 학원명 검색" />
            </div>
            <SubHeader label="값 입력됨" />
            <div className="w-[360px]">
              <SearchBar placeholder="검색" value="파이썬 기초" />
            </div>
          </div>
        )}

        {/* ── DatePicker ── */}
        {nav === "DatePicker" && (
          <div>
            <SectionHeader name="DatePicker" tag="신규" />
            <p className="text-[13px] text-[#555] mb-4">날짜 선택기. 캘린더형과 롤링(스크롤)형을 지원합니다.</p>
            <PropsTable rows={[
              { prop: "type", type: '"calendar" | "rolling"', default: '"calendar"', desc: "날짜 선택 방식" },
              { prop: "value", type: "string", default: "—", desc: "선택된 날짜" },
            ]} />
            <SubHeader label='type = "calendar"' />
            <DatePicker type="calendar" />
            <SubHeader label='type = "rolling"' />
            <DatePicker type="rolling" value="2026-04-15" />
          </div>
        )}

        {/* ── TagChip ── */}
        {nav === "TagChip" && (
          <div>
            <SectionHeader name="TagChip" tag="신규" />
            <p className="text-[13px] text-[#555] mb-4">태그/칩 컴포넌트. 관심사 선택, 추천 질문, 관련 질문, 키워드 필터 타입을 지원합니다.</p>
            <PropsTable rows={[
              { prop: "type", type: '"interest" | "recommend-question" | "related-question" | "keyword-filter"', default: '"keyword-filter"', desc: "칩 타입" },
              { prop: "text", type: "string", default: "—", desc: "텍스트" },
              { prop: "selected", type: "boolean", default: "false", desc: "선택 여부" },
              { prop: "maxSelect", type: "number", default: "—", desc: "최대 선택 수 (관심사 전용)" },
            ]} />
            <SubHeader label='type = "interest"' />
            <div className="flex flex-wrap gap-2">
              <TagChip type="interest" text="코딩" selected maxSelect={5} />
              <TagChip type="interest" text="수학" maxSelect={5} />
              <TagChip type="interest" text="영어" maxSelect={5} />
              <TagChip type="interest" text="과학" selected maxSelect={5} />
            </div>
            <SubHeader label='type = "recommend-question"' />
            <div className="flex flex-wrap gap-2">
              <TagChip type="recommend-question" text="수업 일정은 어떻게 되나요?" />
              <TagChip type="recommend-question" text="수강료가 궁금해요" />
            </div>
            <SubHeader label='type = "related-question"' />
            <div className="flex flex-wrap gap-2">
              <TagChip type="related-question" text="비슷한 수업 추천" />
              <TagChip type="related-question" text="수강 후기" />
            </div>
            <SubHeader label='type = "keyword-filter"' />
            <div className="flex flex-wrap gap-2">
              <TagChip type="keyword-filter" text="전체" selected />
              <TagChip type="keyword-filter" text="IT" />
              <TagChip type="keyword-filter" text="디자인" />
              <TagChip type="keyword-filter" text="언어" />
            </div>
          </div>
        )}

        {/* ── FloatingCartButton ── */}
        {nav === "FloatingCartButton" && (
          <div>
            <SectionHeader name="FloatingCartButton" tag="신규" />
            <p className="text-[13px] text-[#555] mb-4">플로팅 장바구니 버튼. 담긴 수업 수가 0이면 비활성(회색) 상태입니다.</p>
            <PropsTable rows={[
              { prop: "count", type: "number", default: "0", desc: "담긴 수업 수 (0이면 비활성)" },
            ]} />
            <SubHeader label="활성 (count=3)" />
            <FloatingCartButton count={3} />
            <SubHeader label="비활성 (count=0)" />
            <FloatingCartButton count={0} />
          </div>
        )}

        {/* ── Toast ── */}
        {nav === "Toast" && (
          <div>
            <SectionHeader name="Toast" tag="신규" />
            <p className="text-[13px] text-[#555] mb-4">하단 토스트 메시지. 안내/에러/성공 타입과 노출 시간을 지정합니다.</p>
            <PropsTable rows={[
              { prop: "text", type: "string", default: "—", desc: "토스트 메시지" },
              { prop: "type", type: '"info" | "error" | "success"', default: '"info"', desc: "토스트 타입" },
              { prop: "duration", type: "number", default: "3", desc: "노출 시간 (초)" },
            ]} />
            <SubHeader label='type = "info"' />
            <Toast text="수업이 장바구니에 담겼습니다." type="info" />
            <SubHeader label='type = "error"' />
            <Toast text="네트워크 오류가 발생했습니다." type="error" />
            <SubHeader label='type = "success"' />
            <Toast text="수강 신청이 완료되었습니다!" type="success" />
          </div>
        )}

        {/* ── BottomSheet ── */}
        {nav === "BottomSheet" && (
          <div>
            <SectionHeader name="BottomSheet" tag="신규" />
            <p className="text-[13px] text-[#555] mb-4">하단 시트. 기본/로그인유도/계정찾기/상담신청/대기신청/자주쓰는서비스 타입을 지원합니다.</p>
            <PropsTable rows={[
              { prop: "type",            type: '"default" | "login-prompt" | "account-find" | "consult" | "waitlist" | "quick-service"', default: '"default"', desc: "시트 타입" },
              { prop: "title",           type: "string",              default: "—",    desc: "타이틀 (default 타입만)" },
              { prop: "isOpen",          type: "boolean",             default: "false", desc: "열림 여부" },
              { prop: "services",        type: "{ id, icon, label }[]", default: "[]", desc: "서비스 목록 (quick-service 타입만)" },
              { prop: "defaultSelected", type: "string[]",            default: "[]",   desc: "기본 선택 id 배열 (quick-service 타입만)" },
              { prop: "maxSelect",       type: "number",              default: "10",   desc: "최대 선택 수 (quick-service 타입만)" },
            ]} />
            <SubHeader label='type = "default"' />
            <BottomSheet type="default" title="옵션 선택" isOpen>
              <div className="flex flex-col gap-2">
                <button className="w-full h-[44px] rounded-[10px] bg-[#f5f5f7] text-[14px] text-[#333] font-medium">옵션 1</button>
                <button className="w-full h-[44px] rounded-[10px] bg-[#f5f5f7] text-[14px] text-[#333] font-medium">옵션 2</button>
              </div>
            </BottomSheet>
            <SubHeader label='type = "login-prompt"' />
            <BottomSheet type="login-prompt" isOpen />
            <SubHeader label='type = "account-find"' />
            <BottomSheet type="account-find" isOpen />
            <SubHeader label='type = "consult"' />
            <BottomSheet type="consult" isOpen />
            <SubHeader label='type = "waitlist"' />
            <BottomSheet type="waitlist" isOpen />
            <SubHeader label='type = "quick-service" (자주 쓰는 서비스)' />
            <BottomSheet
              type="quick-service"
              isOpen
              maxSelect={10}
              defaultSelected={["oneday", "job", "inquiry", "book", "bler"]}
              services={[
                { id: "oneday",   icon: "🎨", label: "원데이클래스" },
                { id: "job",      icon: "💼", label: "채용정보" },
                { id: "inquiry",  icon: "💬", label: "내 학습문의" },
                { id: "book",     icon: "📚", label: "교재몰" },
                { id: "bler",     icon: "🎓", label: "BLER" },
                { id: "test",     icon: "📝", label: "기출문제" },
                { id: "schedule", icon: "📅", label: "내 수업일정" },
                { id: "review",   icon: "⭐", label: "수강후기" },
                { id: "event",    icon: "🎉", label: "이벤트" },
                { id: "faq",      icon: "❓", label: "FAQ" },
              ]}
            />
          </div>
        )}

        {/* ── SkeletonUI ── */}
        {nav === "SkeletonUI" && (
          <div>
            <SectionHeader name="SkeletonUI" tag="신규" />
            <p className="text-[13px] text-[#555] mb-4">로딩 스켈레톤 UI. 텍스트/카드/리스트 타입을 지원합니다.</p>
            <PropsTable rows={[
              { prop: "type", type: '"text" | "card" | "list"', default: '"text"', desc: "스켈레톤 타입" },
            ]} />
            <SubHeader label='type = "text"' />
            <div className="w-[360px] bg-white rounded-[14px] border border-[#ebebeb]">
              <SkeletonUI type="text" />
            </div>
            <SubHeader label='type = "card"' />
            <div className="w-[360px]">
              <SkeletonUI type="card" />
            </div>
            <SubHeader label='type = "list"' />
            <div className="w-[360px] bg-white rounded-[14px] border border-[#ebebeb]">
              <SkeletonUI type="list" />
            </div>
          </div>
        )}

        {/* ── ProgressBar ── */}
        {nav === "ProgressBar" && (
          <div>
            <SectionHeader name="ProgressBar" tag="신규" />
            <p className="text-[13px] text-[#555] mb-4">진행 바. 현재값과 최대값으로 퍼센트를 계산하며, 퍼센트 표시를 토글할 수 있습니다.</p>
            <PropsTable rows={[
              { prop: "current", type: "number", default: "0", desc: "현재 값" },
              { prop: "max", type: "number", default: "100", desc: "최대 값" },
              { prop: "showPercent", type: "boolean", default: "false", desc: "퍼센트 텍스트 표시" },
            ]} />
            <SubHeader label="퍼센트 표시 있음 (70%)" />
            <div className="w-[360px]">
              <ProgressBar current={70} max={100} showPercent />
            </div>
            <SubHeader label="퍼센트 표시 없음 (30%)" />
            <div className="w-[360px]">
              <ProgressBar current={30} max={100} />
            </div>
            <SubHeader label="0% / 100%" />
            <div className="w-[360px] flex flex-col gap-3">
              <ProgressBar current={0} max={100} showPercent />
              <ProgressBar current={100} max={100} showPercent />
            </div>
          </div>
        )}

        {/* ── Stepper ── */}
        {nav === "Stepper" && (
          <div>
            <SectionHeader name="Stepper" tag="신규" />
            <p className="text-[13px] text-[#555] mb-4">단계 표시기 (세로형). generic과 mentoring variant를 지원하며, mentoring은 날짜를 표시합니다.</p>
            <PropsTable rows={[
              { prop: "variant", type: '"generic" | "mentoring"', default: '"generic"', desc: "스타일 변형" },
              { prop: "steps", type: "string[]", default: "[]", desc: "단계 레이블 배열" },
              { prop: "currentStep", type: "number", default: "1", desc: "현재 단계 (1-based)" },
              { prop: "dates", type: "string[]", default: "—", desc: "단계별 날짜 (mentoring만)" },
            ]} />
            <SubHeader label='variant = "generic" (2단계)' />
            <div className="w-[360px] bg-white rounded-[14px] border border-[#ebebeb] p-4">
              <Stepper variant="generic" steps={["학원 선택", "수업 선택", "정보 입력", "신청 완료"]} currentStep={2} />
            </div>
            <SubHeader label='variant = "mentoring" (3단계)' />
            <div className="w-[360px] bg-white rounded-[14px] border border-[#ebebeb] p-4">
              <Stepper variant="mentoring" steps={["신청 접수", "멘토 배정", "멘토링 진행", "완료"]} currentStep={3} dates={["2026.04.01", "2026.04.03", "2026.04.05 ~", "—"]} />
            </div>
          </div>
        )}

        {/* ── StatusBadge ── */}
        {nav === "StatusBadge" && (
          <div>
            <SectionHeader name="StatusBadge" tag="신규" />
            <p className="text-[13px] text-[#555] mb-4">상태 뱃지. 12가지 상태 타입에 따라 색상이 자동 결정됩니다.</p>
            <PropsTable rows={[
              { prop: "type", type: "string", default: "—", desc: "상태 타입 (신청완료/신청대기/종료/모집중/마감/무료/보관중/처리완료/폐기완료/접수중/접수예정/접수마감)" },
            ]} />
            <SubHeader label="전체 12종" />
            <div className="flex flex-wrap gap-2">
              {["신청완료", "신청대기", "종료", "모집중", "마감", "무료", "보관중", "처리완료", "폐기완료", "접수중", "접수예정", "접수마감"].map(t => (
                <StatusBadge key={t} type={t} />
              ))}
            </div>
          </div>
        )}

        {/* ── Tooltip ── */}
        {nav === "Tooltip" && (
          <div>
            <SectionHeader name="Tooltip" tag="신규" />
            <p className="text-[13px] text-[#555] mb-4">툴팁 컴포넌트. 클릭/호버 트리거와 4방향(상/하/좌/우) 노출을 지원합니다.</p>
            <PropsTable rows={[
              { prop: "content", type: "string", default: "—", desc: "툴팁 내용" },
              { prop: "trigger", type: '"click" | "hover"', default: '"click"', desc: "트리거 방식" },
              { prop: "direction", type: '"top" | "bottom" | "left" | "right"', default: '"top"', desc: "노출 방향" },
            ]} />
            <SubHeader label="방향별 (클릭하여 확인)" />
            <div className="flex gap-12 items-center py-8 px-6">
              <div className="flex flex-col items-center gap-1">
                <Tooltip content="상단 툴팁" trigger="click" direction="top" />
                <span className="text-[10px] text-[#aaa]">top</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Tooltip content="하단 툴팁" trigger="click" direction="bottom" />
                <span className="text-[10px] text-[#aaa]">bottom</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Tooltip content="좌측 툴팁" trigger="click" direction="left" />
                <span className="text-[10px] text-[#aaa]">left</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Tooltip content="우측 툴팁" trigger="click" direction="right" />
                <span className="text-[10px] text-[#aaa]">right</span>
              </div>
            </div>
            <SubHeader label="호버 트리거" />
            <div className="flex items-center gap-2 py-4">
              <span className="text-[13px] text-[#555]">도움말</span>
              <Tooltip content="호버하면 나타납니다" trigger="hover" direction="right" />
            </div>
          </div>
        )}

        {/* ── CourseCard ── */}
        {nav === "CourseCard" && (
          <div>
            <SectionHeader name="CourseCard" tag="신규" />
            <p className="text-[13px] text-[#555] mb-4">수업 카드. 수강중/수강예정/수강완료/추천/인기 타입에 따라 레이아웃이 달라집니다.</p>
            <PropsTable rows={[
              { prop: "type", type: '"enrolled" | "upcoming" | "completed" | "recommended" | "popular"', default: '"recommended"', desc: "카드 타입" },
              { prop: "thumbnail", type: "string", default: "—", desc: "썸네일 이미지 URL" },
              { prop: "interestTag", type: "string", default: "—", desc: "관심사 태그" },
              { prop: "courseName", type: "string", default: "—", desc: "강의명" },
              { prop: "department", type: "string", default: "—", desc: "계열" },
              { prop: "progress", type: "number", default: "—", desc: "진도율 (수강중만, 0~100)" },
              { prop: "bookmarked", type: "boolean", default: "false", desc: "북마크 (추천/인기만)" },
            ]} />
            <SubHeader label='type = "enrolled" (수강중)' />
            <div className="flex gap-3">
              <CourseCard type="enrolled" interestTag="IT / 코딩" courseName="파이썬 기초 완전정복" department="IT 계열" progress={65} />
            </div>
            <SubHeader label='type = "upcoming" (수강예정)' />
            <div className="flex gap-3">
              <CourseCard type="upcoming" interestTag="언어" courseName="영어 회화 중급반" department="언어 계열" />
            </div>
            <SubHeader label='type = "completed" (수강완료)' />
            <div className="flex gap-3">
              <CourseCard type="completed" interestTag="수학" courseName="수학 기초반 A" department="수학 계열" />
            </div>
            <SubHeader label='type = "recommended" (추천)' />
            <div className="flex gap-3">
              <CourseCard type="recommended" interestTag="IT / 코딩" courseName="웹 개발 입문" department="IT 계열" bookmarked />
              <CourseCard type="recommended" interestTag="디자인" courseName="UX 디자인 기초" department="디자인 계열" />
            </div>
            <SubHeader label='type = "popular" (인기)' />
            <div className="flex gap-3">
              <CourseCard type="popular" interestTag="IT / 코딩" courseName="자바스크립트 마스터" department="IT 계열" bookmarked />
            </div>
          </div>
        )}

        {/* ── PostCard ── */}
        {nav === "PostCard" && (
          <div>
            <SectionHeader name="PostCard" tag="신규" />
            <p className="text-[13px] text-[#555] mb-4">커뮤니티 게시글 카드. 자유/질문/스터디/수강후기 타입을 지원합니다.</p>
            <PropsTable rows={[
              { prop: "type", type: '"free" | "question" | "study" | "review"', default: '"free"', desc: "게시글 타입" },
              { prop: "recruitStatus", type: "string", default: "—", desc: "모집 상태 (스터디만)" },
              { prop: "title", type: "string", default: "—", desc: "제목" },
              { prop: "preview", type: "string", default: "—", desc: "내용 미리보기" },
              { prop: "author", type: "string", default: "—", desc: "작성자" },
              { prop: "createdAt", type: "string", default: "—", desc: "작성일" },
            ]} />
            <SubHeader label='type = "free"' />
            <div className="w-[360px]">
              <CardSlot mode="list">
                <PostCard type="free" title="학원 근처 맛집 추천해주세요" preview="강남역 근처 점심 먹기 좋은 곳 아시는 분..." author="맛집탐험가" createdAt="2분 전" />
              </CardSlot>
            </div>
            <SubHeader label='type = "question"' />
            <div className="w-[360px]">
              <CardSlot mode="list">
                <PostCard type="question" title="파이썬 리스트 컴프리헨션 질문" preview="for문 안에 if문 넣는 거 어떻게 하나요?" author="코딩초보" createdAt="10분 전" />
              </CardSlot>
            </div>
            <SubHeader label='type = "study" (모집중)' />
            <div className="w-[360px]">
              <CardSlot mode="list">
                <PostCard type="study" recruitStatus="모집중" title="자바스크립트 스터디 모집" preview="매주 토요일 2시간 같이 공부하실 분..." author="스터디왕" createdAt="1시간 전" />
              </CardSlot>
            </div>
            <SubHeader label='type = "review"' />
            <div className="w-[360px]">
              <CardSlot mode="list">
                <PostCard type="review" title="파이썬 기초반 수강 후기" preview="3개월 다니고 나서 확실히 실력이 늘었어요. 특히 선생님이..." author="수료생A" createdAt="3일 전" />
              </CardSlot>
            </div>
          </div>
        )}

        {/* ── NotificationCard ── */}
        {nav === "NotificationCard" && (
          <div>
            <SectionHeader name="NotificationCard" tag="신규" />
            <p className="text-[13px] text-[#555] mb-4">알림 카드. 읽음/안읽음 상태에 따라 스타일이 달라집니다.</p>
            <PropsTable rows={[
              { prop: "category", type: "string", default: "—", desc: "알림 카테고리" },
              { prop: "message", type: "string", default: "—", desc: "알림 문구" },
              { prop: "receivedAt", type: "string", default: "—", desc: "수신 일시" },
              { prop: "isRead", type: "boolean", default: "false", desc: "읽음 여부" },
            ]} />
            <SubHeader label="안읽음" />
            <div className="w-[360px]">
              <CardSlot mode="list">
                <NotificationCard category="수업 알림" message="내일 오전 10시 '파이썬 기초반' 수업이 있습니다." receivedAt="방금 전" isRead={false} />
                <NotificationCard category="커뮤니티" message="'자바스크립트 스터디 모집' 게시글에 댓글이 달렸습니다." receivedAt="5분 전" isRead={false} />
              </CardSlot>
            </div>
            <SubHeader label="읽음" />
            <div className="w-[360px]">
              <CardSlot mode="list">
                <NotificationCard category="신청 알림" message="수강 신청이 완료되었습니다." receivedAt="2시간 전" isRead />
              </CardSlot>
            </div>
          </div>
        )}

        {/* ── AIAnswerCard ── */}
        {nav === "AIAnswerCard" && (
          <div>
            <SectionHeader name="AIAnswerCard" tag="신규" />
            <p className="text-[13px] text-[#555] mb-4">AI 답변 카드. 로딩중/답변완료/답변없음 상태를 표현합니다.</p>
            <PropsTable rows={[
              { prop: "questionTitle", type: "string", default: "—", desc: "질문 타이틀" },
              { prop: "answerText", type: "string", default: "—", desc: "답변 텍스트 (답변완료 시)" },
              { prop: "status", type: '"loading" | "completed" | "no-answer"', default: '"completed"', desc: "답변 상태" },
            ]} />
            <SubHeader label='status = "completed"' />
            <div className="w-[360px]">
              <AIAnswerCard questionTitle="파이썬에서 리스트와 튜플의 차이점은?" answerText="리스트(list)는 변경 가능(mutable)한 자료형이고, 튜플(tuple)은 변경 불가능(immutable)한 자료형입니다. 리스트는 대괄호 []로, 튜플은 소괄호 ()로 선언합니다." status="completed" />
            </div>
            <SubHeader label='status = "loading"' />
            <div className="w-[360px]">
              <AIAnswerCard questionTitle="자바스크립트 클로저란 무엇인가요?" status="loading" />
            </div>
            <SubHeader label='status = "no-answer"' />
            <div className="w-[360px]">
              <AIAnswerCard questionTitle="양자 컴퓨팅의 원리는?" status="no-answer" />
            </div>
          </div>
        )}

        {/* ── Attachment ── */}
        {nav === "Attachment" && (
          <div>
            <SectionHeader name="Attachment" tag="신규" />
            <p className="text-[13px] text-[#555] mb-4">파일 첨부 컴포넌트. 이미지/파일 타입과 업로드 상태를 지원합니다.</p>
            <PropsTable rows={[
              { prop: "type", type: '"image" | "file"', default: '"file"', desc: "첨부 타입" },
              { prop: "fileName", type: "string", default: "—", desc: "파일명" },
              { prop: "extension", type: "string", default: "—", desc: "확장자" },
              { prop: "status", type: '"default" | "uploading" | "complete" | "error" | "downloadable" | "failed"', default: '"default"', desc: "상태" },
              { prop: "showDelete", type: "boolean", default: "true", desc: "삭제 버튼 표시" },
            ]} />
            <SubHeader label="기본" />
            <div className="w-[360px]">
              <Attachment type="file" fileName="수강신청서" extension="pdf" status="default" />
            </div>
            <SubHeader label="업로드 중" />
            <div className="w-[360px]">
              <Attachment type="file" fileName="과제물" extension="doc" status="uploading" showDelete={false} />
            </div>
            <SubHeader label="완료" />
            <div className="w-[360px]">
              <Attachment type="file" fileName="성적표" extension="xls" status="complete" />
            </div>
            <SubHeader label="에러" />
            <div className="w-[360px]">
              <Attachment type="image" fileName="프로필사진" extension="jpg" status="error" />
            </div>
            <SubHeader label="다운로드 가능" />
            <div className="w-[360px]">
              <Attachment type="file" fileName="교재" extension="pdf" status="downloadable" showDelete={false} />
            </div>
          </div>
        )}

        {/* ── Slider ── */}
        {nav === "Slider" && (
          <div>
            <SectionHeader name="Slider" tag="신규" />
            <p className="text-[13px] text-[#555] mb-4">이미지/콘텐츠 슬라이더. 인디케이터와 자동재생을 지원합니다.</p>
            <PropsTable rows={[
              { prop: "items", type: "array", default: "[]", desc: "슬라이더 아이템 배열 (URL 문자열 또는 { label } 객체)" },
              { prop: "showIndicator", type: "boolean", default: "true", desc: "인디케이터 표시" },
              { prop: "autoPlay", type: "boolean", default: "false", desc: "자동 재생" },
              { prop: "autoPlayInterval", type: "number", default: "3", desc: "자동 재생 간격 (초)" },
            ]} />
            <SubHeader label="인디케이터 있음" />
            <div className="w-[360px]">
              <Slider items={[{ label: "배너 1" }, { label: "배너 2" }, { label: "배너 3" }]} showIndicator />
            </div>
            <SubHeader label="자동재생 표시" />
            <div className="w-[360px]">
              <Slider items={[{ label: "프로모션 1" }, { label: "프로모션 2" }]} autoPlay autoPlayInterval={5} />
            </div>
          </div>
        )}

        {/* ── ImageViewer ── */}
        {nav === "ImageViewer" && (
          <div>
            <SectionHeader name="ImageViewer" tag="신규" />
            <p className="text-[13px] text-[#555] mb-4">이미지 뷰어. 스와이프(좌우 이동)를 지원하며 현재 이미지 번호를 표시합니다.</p>
            <PropsTable rows={[
              { prop: "images", type: "string[]", default: "[]", desc: "이미지 URL 배열" },
              { prop: "swipeable", type: "boolean", default: "true", desc: "스와이프 가능 여부" },
            ]} />
            <SubHeader label="이미지 3장 (스와이프)" />
            <div className="w-[360px]">
              <ImageViewer images={["https://picsum.photos/seed/v1/360/240", "https://picsum.photos/seed/v2/360/240", "https://picsum.photos/seed/v3/360/240"]} swipeable />
            </div>
            <SubHeader label="스와이프 비활성" />
            <div className="w-[360px]">
              <ImageViewer images={["https://picsum.photos/seed/v4/360/240"]} swipeable={false} />
            </div>
          </div>
        )}

        {/* ── ProfileCard ── */}
        {nav === "ProfileCard" && (
          <div>
            <SectionHeader name="ProfileCard" tag="신규" />
            <p className="text-[13px] text-[#555] mb-4">사용자 프로필 카드. 아바타, 닉네임, 아이디, 포인트, 쿠폰을 표시합니다.</p>
            <PropsTable rows={[
              { prop: "avatar", type: "string", default: "—", desc: "아바타 이미지 URL" },
              { prop: "nickname", type: "string", default: "—", desc: "닉네임" },
              { prop: "userId", type: "string", default: "—", desc: "아이디 (이메일)" },
              { prop: "points", type: "number", default: "—", desc: "포인트" },
              { prop: "couponCount", type: "number", default: "—", desc: "쿠폰 수" },
              { prop: "showEdit", type: "boolean", default: "true", desc: "편집 버튼 표시" },
            ]} />
            <SubHeader label="편집 버튼 있음" />
            <div className="w-[360px] bg-white rounded-[14px] border border-[#ebebeb]">
              <ProfileCard nickname="홍길동" userId="hong@email.com" points={12500} couponCount={3} showEdit />
            </div>
            <SubHeader label="편집 버튼 없음" />
            <div className="w-[360px] bg-white rounded-[14px] border border-[#ebebeb]">
              <ProfileCard nickname="김수학" userId="math@email.com" points={5000} couponCount={0} showEdit={false} />
            </div>
          </div>
        )}

        {/* ── ProfileImageUploader ── */}
        {nav === "ProfileImageUploader" && (
          <div>
            <SectionHeader name="ProfileImageUploader" tag="신규" />
            <p className="text-[13px] text-[#555] mb-4">프로필 이미지 업로더. 기본/업로드중/완료/에러 상태를 표현합니다.</p>
            <PropsTable rows={[
              { prop: "status", type: '"default" | "uploading" | "complete" | "error"', default: '"default"', desc: "업로드 상태" },
              { prop: "showDelete", type: "boolean", default: "false", desc: "삭제 버튼 표시 (완료 시)" },
            ]} />
            <SubHeader label="상태별" />
            <div className="flex gap-8 items-start">
              <div className="flex flex-col items-center gap-1">
                <ProfileImageUploader status="default" />
                <span className="text-[10px] text-[#aaa]">기본</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <ProfileImageUploader status="uploading" />
                <span className="text-[10px] text-[#aaa]">업로드중</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <ProfileImageUploader status="complete" showDelete />
                <span className="text-[10px] text-[#aaa]">완료</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <ProfileImageUploader status="error" />
                <span className="text-[10px] text-[#aaa]">에러</span>
              </div>
            </div>
          </div>
        )}

        {/* ── SelectionCounter ── */}
        {nav === "SelectionCounter" && (
          <div>
            <SectionHeader name="SelectionCounter" tag="신규" />
            <p className="text-[13px] text-[#555] mb-4">선택 카운터. 현재 선택 수와 최소 기준을 비교하여 충족/미달 상태를 표시합니다.</p>
            <PropsTable rows={[
              { prop: "current", type: "number", default: "0", desc: "현재 선택 수" },
              { prop: "minimum", type: "number", default: "3", desc: "최소 기준" },
              { prop: "status", type: '"met" | "unmet"', default: "auto", desc: "상태 (자동 계산 또는 직접 지정)" },
            ]} />
            <SubHeader label="미달 (1/3)" />
            <div className="w-[300px]">
              <SelectionCounter current={1} minimum={3} />
            </div>
            <SubHeader label="충족 (3/3)" />
            <div className="w-[300px]">
              <SelectionCounter current={3} minimum={3} />
            </div>
            <SubHeader label="초과 (5/3)" />
            <div className="w-[300px]">
              <SelectionCounter current={5} minimum={3} />
            </div>
          </div>
        )}

        {/* ── AttendanceCalendar ── */}
        {nav === "AttendanceCalendar" && (
          <div>
            <SectionHeader name="AttendanceCalendar" tag="신규" />
            <p className="text-[13px] text-[#555] mb-4">출결 달력. 날짜별 출석/결석/지각/사유 상태를 시각적으로 표시합니다.</p>
            <PropsTable rows={[
              { prop: "data", type: "{ date: string, status: string }[]", default: "[]", desc: "날짜별 출결 데이터 (present/absent/late/excused)" },
              { prop: "currentMonth", type: "string", default: "—", desc: '연월 (예: "2026-04")' },
            ]} />
            <SubHeader label="2026년 4월" />
            <div className="w-[320px]">
              <AttendanceCalendar
                currentMonth="2026-04"
                data={[
                  { date: "2026-04-01", status: "present" },
                  { date: "2026-04-02", status: "present" },
                  { date: "2026-04-03", status: "late" },
                  { date: "2026-04-06", status: "present" },
                  { date: "2026-04-07", status: "absent" },
                  { date: "2026-04-08", status: "present" },
                  { date: "2026-04-09", status: "excused" },
                ]}
              />
            </div>
          </div>
        )}

        {/* ── StarRating ── */}
        {nav === "StarRating" && (
          <div>
            <SectionHeader name="StarRating" tag="신규" />
            <p className="text-[13px] text-[#555] mb-4">별점 평가. 1~5점 선택 또는 읽기 전용으로 표시합니다.</p>
            <PropsTable rows={[
              { prop: "score", type: "number (1-5)", default: "0", desc: "별점" },
              { prop: "readOnly", type: "boolean", default: "false", desc: "읽기 전용 여부" },
            ]} />
            <SubHeader label="인터랙티브 (클릭 가능)" />
            <StarRating score={3} />
            <SubHeader label="읽기 전용 (4점)" />
            <StarRating score={4} readOnly />
            <SubHeader label="읽기 전용 (5점)" />
            <StarRating score={5} readOnly />
          </div>
        )}

        {/* ── ContextMenu ── */}
        {nav === "ContextMenu" && (
          <div>
            <SectionHeader name="ContextMenu" tag="신규" />
            <p className="text-[13px] text-[#555] mb-4">컨텍스트 메뉴. 게시글/댓글의 소유자 여부에 따라 메뉴 항목이 달라집니다.</p>
            <PropsTable rows={[
              { prop: "type", type: '"my-post" | "other-post" | "my-comment" | "other-comment" | "my-post-other-comment"', default: '"my-post"', desc: "메뉴 타입" },
              { prop: "isOpen", type: "boolean", default: "false", desc: "메뉴 열림 여부" },
            ]} />
            <SubHeader label='type = "my-post"' />
            <ContextMenu type="my-post" isOpen />
            <SubHeader label='type = "other-post"' />
            <ContextMenu type="other-post" isOpen />
            <SubHeader label='type = "my-comment"' />
            <ContextMenu type="my-comment" isOpen />
            <SubHeader label='type = "other-comment"' />
            <ContextMenu type="other-comment" isOpen />
            <SubHeader label='type = "my-post-other-comment"' />
            <ContextMenu type="my-post-other-comment" isOpen />
          </div>
        )}

      </main>
    </div>
  );
}
