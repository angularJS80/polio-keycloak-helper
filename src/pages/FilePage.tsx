import React from 'react';
import {
  Button,
  FormControlLabel,
  Switch,
  TextField,
  Stack,
  CircularProgress,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import CommonMessageDialog from '../components/CommonMessageDialog';
import { useMessage } from '../hooks/useMessage';
import { useFilePage} from '../hooks/useFilePage';
import { useNavigate } from 'react-router-dom';

export default function FilePage() {
  const navigate = useNavigate();
  
  const { message, showSuccess, showError, clearMessage } = useMessage();
  const {
    selectedFile,
    isPublic,
    setIsPublic,
    loading,
    fileList,      // 추가
    fetchFiles,    // 추가    
    handleFileChange,
    handleUpload,
    toggleVisibility,
  } = useFilePage(showSuccess, showError);

  return (
    <Layout>
      <PageHeader icon={UploadFileIcon} title="파일 관리" iconColor="#1976d2" />
      <CommonMessageDialog message={message} onClose={clearMessage} />

      <Stack spacing={2}>
        <Button variant="outlined" component="label" disabled={loading}>
          {selectedFile ? selectedFile.name : '파일 선택'}
          <input type="file" hidden onChange={handleFileChange} />
        </Button>
        {/* 공개/비공개 스위치 추가 */}
        <FormControlLabel
          control={
            <Switch 
              checked={isPublic} 
              onChange={(e) => setIsPublic(e.target.checked)} 
            />
          }
          label={isPublic ? "공개 (모두가 접근 가능)" : "비공개 (본인만 접근 가능)"}
        />

        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={loading || !selectedFile}
          startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <UploadFileIcon />}
        >
          {loading ? '처리 중...' : '업로드'}
        </Button>

{/* 조회 버튼 추가 */}
<Button variant="outlined" onClick={fetchFiles} disabled={loading}>
          내 파일 조회하기
        </Button>
{/* 파일 목록 출력 */}
{loading && <CircularProgress sx={{ mt: 2 }} />}

{!loading && fileList.length > 0 && (
  <Stack spacing={1} sx={{ mt: 2 }}>
    {fileList.map((file) => (
      <div 
        key={file.key} 
        style={{ 
          padding: '12px', 
          border: '1px solid #ccc', 
          borderRadius: '4px',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between' 
        }}
      >
        <div>
          <strong>{file.fileName}</strong> 
          <span style={{ 
            marginLeft: '8px', 
            fontSize: '0.85rem',
            color: file.visibility === 'PUBLIC' ? '#2e7d32' : '#757575',
            fontWeight: 'bold'
          }}>
            [{file.visibility}]
          </span>
        </div>

        <Stack direction="row" spacing={1}>
          {/* 공개/비공개 전환 버튼 */}
          <Button 
            variant="outlined" 
            size="small" 
            color={file.visibility === 'PUBLIC' ? 'warning' : 'primary'}
            onClick={() => toggleVisibility(file.id, file.visibility)}
            disabled={loading}
          >
            {file.visibility === 'PUBLIC' ? '비공개로 전환' : '공개하기'}
          </Button>

          {/* 다운로드 버튼 */}
          {file.presignedUrl && (
            <Button 
              variant="contained" 
              size="small" 
              component="a" 
              href={file.presignedUrl} 
              target="_blank" 
              rel="noreferrer"
            >
              다운로드
            </Button>
          )}
        </Stack>
      </div>
    ))}
  </Stack>
)}
        
        <Button
          variant="contained"
          onClick={() => navigate('/welcome')}
          startIcon={<ArrowBackIcon />}
        >
          환영 페이지로
        </Button>
      </Stack>
    </Layout>
  );
}
