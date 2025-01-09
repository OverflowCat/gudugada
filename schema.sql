CREATE TABLE comments (
    id TEXT PRIMARY KEY,           -- 生成的评论 ID (generateId())
    name TEXT NOT NULL,            -- 评论者昵称
    url TEXT NOT NULL,             -- 评论者主页链接
    email TEXT,                    -- 邮箱，可为空
    message TEXT NOT NULL,         -- 评论内容
    slug TEXT NOT NULL,            -- 文章标识符
    timestamp INTEGER NOT NULL,    -- 评论时间戳
    pr_number INTEGER NOT NULL,    -- GitHub PR 编号
    created_at TEXT NOT NULL       -- ISO 格式的创建时间
);

CREATE INDEX idx_comments_slug ON comments(slug);
CREATE INDEX idx_comments_pr_number ON comments(pr_number);
CREATE INDEX idx_email ON comments(email);
CREATE INDEX idx_url ON comments(url);
