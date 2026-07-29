const header=document.getElementById("siteHeader");
const progress=document.getElementById("scrollProgress");
const menuButton=document.getElementById("menuButton");
const navLinks=document.getElementById("navLinks");

function updateScroll(){
  const top=window.scrollY;
  const max=document.documentElement.scrollHeight-window.innerHeight;
  progress.style.width=`${max>0?(top/max)*100:0}%`;
  header.classList.toggle("scrolled",top>15);
}
window.addEventListener("scroll",updateScroll,{passive:true});
updateScroll();

menuButton.addEventListener("click",()=>{
  const open=navLinks.classList.toggle("open");
  menuButton.setAttribute("aria-expanded",String(open));
  menuButton.textContent=open?"CLOSE":"MENU";
});

navLinks.querySelectorAll("a").forEach(link=>{
  link.addEventListener("click",()=>{
    navLinks.classList.remove("open");
    menuButton.setAttribute("aria-expanded","false");
    menuButton.textContent="MENU";
  });
});

document.addEventListener("keydown",event=>{
  if(event.key==="Escape"&&navLinks.classList.contains("open")){
    navLinks.classList.remove("open");
    menuButton.setAttribute("aria-expanded","false");
    menuButton.textContent="MENU";
    menuButton.focus();
  }
});

const observer=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
},{threshold:0.08});
document.querySelectorAll(".reveal").forEach(el=>observer.observe(el));

// ODODOK 무료 기본진단
const diagnosisForm=document.getElementById("diagnosisForm");
if(diagnosisForm){
  const channelOtherCheck=document.getElementById("channelOtherCheck");
  const channelOtherWrap=document.getElementById("channelOtherWrap");
  const concernOtherCheck=document.getElementById("concernOtherCheck");
  const concernOtherWrap=document.getElementById("concernOtherWrap");
  const status=document.getElementById("formStatus");
  const kakaoChatUrl="https://pf.kakao.com/_xmunxnX/chat";

  const toggleOther=(check,wrap)=>{
    wrap.classList.toggle("show",check.checked);
    if(!check.checked){const field=wrap.querySelector("input,textarea");if(field)field.value="";}
  };
  channelOtherCheck.addEventListener("change",()=>toggleOther(channelOtherCheck,channelOtherWrap));
  concernOtherCheck.addEventListener("change",()=>toggleOther(concernOtherCheck,concernOtherWrap));

  diagnosisForm.addEventListener("submit",async(event)=>{
    event.preventDefault();
    status.className="form-status";
    if(!diagnosisForm.reportValidity()){
      status.textContent="필수 항목을 먼저 입력해 주세요.";
      status.classList.add("error");
      return;
    }
    const data=new FormData(diagnosisForm);
    const channels=data.getAll("channels");
    const concerns=data.getAll("concerns");
    const channelOther=document.getElementById("channelOther").value.trim();
    const concernOther=document.getElementById("concernOther").value.trim();
    if(channelOtherCheck.checked&&channelOther)channels.push(`기타: ${channelOther}`);
    if(concernOtherCheck.checked&&concernOther)concerns.push(`기타: ${concernOther}`);
    const today=new Date();
    const code=`ODR-${today.getFullYear()}${String(today.getMonth()+1).padStart(2,"0")}${String(today.getDate()).padStart(2,"0")}-${String(today.getTime()).slice(-4)}`;
    const text=[
      "[ODODOK 무료 기본진단]",
      `진단번호: ${code}`,
      "",
      `업체명/브랜드명: ${data.get("business")}`,
      `연락처: ${data.get("phone")}`,
      `업종: ${data.get("category")}`,
      `지역: ${data.get("region")||"미입력"}`,
      "",
      "■ 운영 중인 채널",
      channels.length?channels.map(v=>`- ${v}`).join("\n"):"- 없음 또는 미선택",
      "",
      "■ 현재 고민",
      concerns.length?concerns.map(v=>`- ${v}`).join("\n"):"- 미선택",
      "",
      "■ 확인할 링크",
      data.get("links")?.trim()||"미입력",
      "",
      "■ 추가 전달사항",
      data.get("message")?.trim()||"미입력"
    ].join("\n");

    try{
      await navigator.clipboard.writeText(text);
      status.textContent="진단 내용이 복사되었습니다. 카카오톡 채팅창에 붙여넣어 전송해 주세요.";
      status.classList.add("success");
    }catch(error){
      const helper=document.createElement("textarea");
      helper.value=text;helper.setAttribute("readonly","");helper.style.position="fixed";helper.style.opacity="0";
      document.body.appendChild(helper);helper.select();document.execCommand("copy");helper.remove();
      status.textContent="진단 내용을 복사했습니다. 카카오톡에서 붙여넣어 주세요.";
      status.classList.add("success");
    }
    window.open(kakaoChatUrl,"_blank","noopener,noreferrer");
  });
}
