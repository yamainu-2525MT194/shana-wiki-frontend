import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from './api';
import ReactMarkdown from 'react-markdown';
import { 
  Container, Typography, Box, Paper, CircularProgress, Button,
  List, ListItem, Link as MuiLink, Chip, Stack // ★Chip, Stackを追加
} from '@mui/material';
import AttachmentIcon from '@mui/icons-material/Attachment';
import FaceIcon from '@mui/icons-material/Face'; // ★アイコン追加
// import { useParams } from 'react-router-dom';

function WikiPage() {
  const { pageId } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // ★修正: localStorageからトークンを手動取得するのをやめ、apiインスタンスに任せる
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

  const handleDelete = async () => {
    if (window.confirm(`本当にこのページ「${page.title}」を削除しますか？`)) {
      try {
        await api.delete(`/pages/${pageId}`); // ★ここもヘッダー手動指定を削除
        alert('ページを削除しました。');
        navigate('/dashboard');
      } catch (err) {
        console.error("ページの削除に失敗しました:", err);
        alert("ページの削除に失敗しました。");
      }
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>;
  }

  if (!page) {
    return <Typography>ページが見つかりません。</Typography>;
  }

  const isPdf = (filename) => {
    return filename.toLowerCase().endsWith('.pdf');
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          {page.title}
        </Typography>

        {/* ★★★ 追加: 関連エンジニアの表示 ★★★ */}
        {page.engineer && (
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <Chip 
                    icon={<FaceIcon />} 
                    label={`関連エンジニア: ${page.engineer.name}`} 
                    color="primary" 
                    variant="outlined" 
                    // 必要であればエンジニア詳細へのリンクにする
                    // onClick={() => navigate(`/engineers/${page.engineer.id}`)}
                />
            </Stack>
        )}

        {user && user.role === 'admin' && (
          <Box sx={{ mb: 2 }}>
            <Button variant="contained" color="secondary" onClick={handleDelete}>
              このページを削除
            </Button>
            <Button component={Link} to={`/pages/edit/${page.id}`} variant="contained" sx={{ ml: 2 }}>
              このページを編集
            </Button>
          </Box>
        )}

        <Paper sx={{ p: 3, mb: 4 }}>
          <ReactMarkdown>{page.content}</ReactMarkdown>
        </Paper>

        {page.files && page.files.length > 0 && (
          <Box>
            <Typography variant="h5" gutterBottom>添付ファイル</Typography>
            <Paper sx={{ p: 2 }}>
              <List>
                {page.files.map((file) => (
                  <ListItem key={file.id}>
                    <AttachmentIcon sx={{ mr: 1 }} />
                    <MuiLink href={file.file_url} target="_blank" rel="noopener noreferrer">
                      {file.filename}
                    </MuiLink>
                  </ListItem>
                ))}
              </List>
            </Paper>

            {page.files.filter(file => isPdf(file.filename)).map(pdfFile => (
              <Box key={`pdf-${pdfFile.id}`} sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>プレビュー: {pdfFile.filename}</Typography>
                <iframe
                  src={pdfFile.file_url}
                  width="100%"
                  height="800px"
                  title={pdfFile.filename}
                  style={{ border: '1px solid #ccc' }}
                />
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Container>
  );
}

export default WikiPage;