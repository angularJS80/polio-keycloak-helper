import { useState, useCallback } from 'react'; // useCallback 추가
import {
  getUploadPresignedUrl,
  updateFileVisibility,
  uploadToS3,
  completeUpload,
  getMyFiles, // 이것도 import 해야 합니다
  FileMeta,   // FileMeta 타입도 import 하세요
} from '../utils/fileProxyApi';
import { handleApiError, handleApiSuccess } from '../utils/apiResponseHandler';

export function useFilePage(
  showSuccess?: (msg: string) => void,
  showError?: (msg: string) => void
) {
  const [isPublic, setIsPublic] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<FileMeta[]>([]); // 상태 추가

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMyFiles();
      setFileList(data);
    } catch (err: any) {
      handleApiError(err, { showError }, '파일 목록 조회 실패');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      if (showError) showError('업로드할 파일을 선택해주세요.');
      return;
    }

    setLoading(true);
    try {
      // visibility를 명시적으로 전달
      alert(isPublic);
      const visibility = isPublic ? 'PUBLIC' : 'PRIVATE';
      const { presignedUrl, key } = await getUploadPresignedUrl(selectedFile.name, selectedFile.type, visibility);
      await uploadToS3(presignedUrl, selectedFile);
      await completeUpload(key);
      handleApiSuccess({ showSuccess, setLoading }, 'S3 업로드가 완료되었습니다.');
      
      // 업로드 직후 목록 자동 갱신 (선택 사항)
      await fetchFiles();
      setSelectedFile(null);
    } catch (err: any) {
      handleApiError(err, { showError, setLoading }, '파일 업로드 실패');
    }
  };

  // useFilePage.ts 내부에 추가할 함수
const toggleVisibility = async (fileId: number, currentVisibility: string) => {
  setLoading(true);
  try {
    const nextVisibility = currentVisibility === 'PUBLIC' ? 'PRIVATE' : 'PUBLIC';
    await updateFileVisibility(fileId, nextVisibility);
    
    // 성공 시 목록 갱신
    await fetchFiles();
    if (showSuccess) showSuccess('파일 상태가 변경되었습니다.');
  } catch (err: any) {
    handleApiError(err, { showError }, '상태 변경 실패');
  } finally {
    setLoading(false);
  }
};
  

  // !!! 가장 중요한 부분: return 객체에 추가 !!!
  return {
    selectedFile,
    loading,
    fileList,      // 외부에서 접근 가능하게 추가
    fetchFiles,    // 외부에서 접근 가능하게 추가
    handleFileChange,
    handleUpload,
    isPublic,
    setIsPublic,
    toggleVisibility,
  };
}