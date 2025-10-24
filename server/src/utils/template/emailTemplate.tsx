interface EmailTemplateProps {
    projectName: string,
}

export function EmailTemplate({projectName}: EmailTemplateProps) {
    return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "20px" }}>
      <p>Thank you for sharing your memories on <strong>MemoryLane</strong>!
         Your contribution has been successfully submitted for <strong>{projectName}</strong>.</p>
      <p>We appreciate your time and effort in helping make this keepsake special.</p>
      <br/>
      <p>Warm regards,<br/>The MemoryLane Team</p>
    </div>
    )
}