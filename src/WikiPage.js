import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from './api';
import ReactMarkdown from 'react-markdown';
import { 
  Container, Typography, Box, Paper, CircularProgress, Button,
  List, ListItem, ListItemIcon, ListItemText, Link as MuiLink, Chip, Stack, Divider
} from '@mui/material';
import AttachmentIcon from '@mui/icons-material/Attachment';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import FaceIcon from '@mui/icons-material/Face';

function WikiPage() {
  const { pageId } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // ★追加: PDFプレビュー用の署名付きURLを保持するState
  const [pdfSignedUrls, setPdfSignedUrls] = useState({});

  // ファイル判定用関数
  const isPdf = (filename) => filename && filename.toLowerCase().endsWith('.pdf');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pageResponse, userResponse] = await Promise.all([
          api.get(`/pages/${pageId}`),
          api.get(`/users/me`)
        ]);
        setPage(pageResponse.data);
        setUser(userResponse.data);
      } catch (error) {
        console.error("データの取得に失敗しました:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [pageId]);

  // ★追加: ページデータ読み込み後に、PDF用の署名付きURLを取得する
  useEffect(() => {
    const fetchPdfUrls = async () => {
      if (page && page.files) {
        const urls = {};
        // PDFファイルのみ抽出して署名付きURLを取得
        const pdfFiles = page.files.filter(f => isPdf(f.filename));
        
        for (const file of pdfFiles) {
          try {
            const res = await api.get(`/files/${file.id}/download`);
            urls[file.id] = res.data.download_url;
          } catch (err) {
            console.error(`PDFプレビュー用URL取得失敗: ${file.filename}`, err);
          }
        }
        setPdfSignedUrls(urls);
      }
    };
    fetchPdfUrls();
  }, [page]);

  const handleDelete = async () => {
    if (window.confirm(`本当にこのページ「${page.title}」を削除しますか？`)) {
      try {
        await api.delete(`/pages/${pageId}`);
        alert('ページを削除しました。');
        navigate('/dashboard');
      } catch (err) {
        console.error("ページの削除に失敗しました:", err);
        alert("ページの削除に失敗しました。");
      }
    }
  };

  // ★追加: ファイルダウンロードハンドラ
  const handleDownload = async (fileId) => {
    try {
      // Backendから署名付きURLを取得
      const response = await api.get(`/files/${fileId}/download`);
      // 別タブで開く
      window.open(response.data.download_url, '_blank');
    } catch (err) {
      console.error("ダウンロードエラー:", err);
      alert("ファイルのダウンロードに失敗しました（権限がないか、有効期限切れの可能性があります）。");
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>;
  if (!page) return <Typography>ページが見つかりません。</Typography>;

  // ファイルタイプに応じたアイコンを返す
  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    if (ext === 'pdf') return <PictureAsPdfIcon color="error" />;
    return <DescriptionIcon color="primary" />;
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        {/* ヘッダーエリア */}
        <Box sx={{ mb: 2 }}>
            <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            {page.title}
            </Typography>
            
            <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="caption" color="text.secondary">
                    作成日: {new Date(page.created_at).toLocaleDateString()}
                </Typography>
                {page.engineer && (
                    <Chip 
                        icon={<FaceIcon />} 
                        label={`関連エンジニア: ${page.engineer.name}`} 
                        size="small"
                        variant="outlined" 
                        onClick={() => navigate(`/engineers/${page.engineer.id}`)}
                    />
                )}
            </Stack>
        </Box>

        {/* 管理者用メニュー */}
        {user && user.role === 'admin' && (
          <Box sx={{ mb: 3 }}>
            <Button component={Link} to={`/pages/edit/${page.id}`} variant="contained" sx={{ mr: 1 }}>
              編集
            </Button>
            <Button variant="outlined" color="error" onClick={handleDelete}>
              削除
            </Button>
          </Box>
        )}

        {/* 本文エリア */}
        <Paper sx={{ p: 4, mb: 4, minHeight: '200px' }}>
  <div className="markdown-body">
    <ReactMarkdown>{page.content}</ReactMarkdown>
  </div>
</Paper>

        {/* ★★★ 添付ファイル表示エリア (修正版) ★★★ */}
        {page.files && page.files.length > 0 && (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <AttachmentIcon sx={{ mr: 1 }} /> 添付ファイル ({page.files.length})
            </Typography>
            <Paper sx={{ mb: 4 }}>
              <List>
                {page.files.map((file, index) => (
                  <React.Fragment key={file.id}>
                      {index > 0 && <Divider />}
                      <ListItem>
                        <ListItemIcon>
                            {getFileIcon(file.filename)}
                        </ListItemIcon>
                        <ListItemText 
                            primary={
                                // ★修正: hrefを削除し、onClickでダウンロード関数を呼び出す
                                <MuiLink 
                                    component="button" 
                                    variant="body1" 
                                    onClick={() => handleDownload(file.id)}
                                    sx={{ fontWeight: 'bold', textDecoration: 'underline', cursor: 'pointer' }}
                                >
                                    {file.filename}
                                </MuiLink>
                            }
                        />
                        {/* ★修正: hrefを削除し、onClickでダウンロード関数を呼び出す */}
                        <Button 
                            variant="outlined" 
                            size="small" 
                            onClick={() => handleDownload(file.id)}
                        >
                            開く
                        </Button>
                      </ListItem>
                  </React.Fragment>
                ))}
              </List>
            </Paper>

            {/* PDFプレビュー表示 (修正版) */}
            {page.files.filter(file => isPdf(file.filename)).map(pdfFile => (
              <Box key={`pdf-${pdfFile.id}`} sx={{ mt: 4 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                    プレビュー: {pdfFile.filename}
                </Typography>
                <Paper variant="outlined" sx={{ p: 1, bgcolor: '#f5f5f5' }}>
                    {/* ★修正: 取得済みの署名付きURLがあれば表示、なければロード中かエラーを表示 */}
                    {pdfSignedUrls[pdfFile.id] ? (
                        <iframe
                            src={pdfSignedUrls[pdfFile.id]}
                            width="100%"
                            height="800px"
                            title={pdfFile.filename}
                            style={{ border: 'none', backgroundColor: 'white' }}
                        />
                    ) : (
                        <Box sx={{ p: 4, textAlign: 'center' }}>
                            <CircularProgress size={24} sx={{ mr: 2 }} />
                            <Typography variant="body2" component="span">プレビューを読み込み中...</Typography>
                        </Box>
                    )}
                </Paper>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Container>
  );
}

export default WikiPage;