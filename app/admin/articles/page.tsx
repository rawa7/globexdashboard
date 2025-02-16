'use client';

import { useState } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Switch,
  InputNumber,
  message,
} from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { articleService } from '@/lib/services/articleService';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

export default function ArticlesPage() {
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const queryClient = useQueryClient();

  const { data: articles, isLoading } = useQuery({
    queryKey: ['articles'],
    queryFn: articleService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: articleService.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['articles']);
      message.success('Article created successfully');
      handleModalClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: articleService.update,
    onSuccess: () => {
      queryClient.invalidateQueries(['articles']);
      message.success('Article updated successfully');
      handleModalClose();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: articleService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['articles']);
      message.success('Article deleted successfully');
    },
  });

  const handleModalOpen = (article = null) => {
    setEditingArticle(article);
    if (article) {
      form.setFieldsValue(article);
    }
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingArticle(null);
    form.resetFields();
  };

  const handleSubmit = async (values) => {
    if (editingArticle) {
      await updateMutation.mutateAsync({ id: editingArticle.id, ...values });
    } else {
      await createMutation.mutateAsync(values);
    }
  };

  const columns = [
    {
      title: 'Title (EN)',
      dataIndex: ['title', 'en'],
      key: 'title_en',
    },
    {
      title: 'Title (AR)',
      dataIndex: ['title', 'ar'],
      key: 'title_ar',
    },
    {
      title: 'Title (CBK)',
      dataIndex: ['title', 'cbk'],
      key: 'title_cbk',
    },
    {
      title: 'Premium',
      dataIndex: 'is_premium',
      key: 'is_premium',
      render: (isPremium) => (isPremium ? 'Yes' : 'No'),
    },
    {
      title: 'Importance Rating',
      dataIndex: 'importance_rating',
      key: 'importance_rating',
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="flex gap-2">
          <Button
            icon={<EditOutlined />}
            onClick={() => handleModalOpen(record)}
            type="link"
          />
          <Button
            icon={<DeleteOutlined />}
            onClick={() => deleteMutation.mutate(record.id)}
            type="link"
            danger
          />
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Articles</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => handleModalOpen()}
        >
          Add Article
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={articles}
        loading={isLoading}
        rowKey="id"
      />

      <Modal
        title={editingArticle ? 'Edit Article' : 'Add Article'}
        open={isModalOpen}
        onCancel={handleModalClose}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Form.Item
              label="Title (English)"
              name={['title', 'en']}
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Title (Arabic)"
              name={['title', 'ar']}
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Title (CBK)"
              name={['title', 'cbk']}
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Form.Item
              label="Content (English)"
              name={['content', 'en']}
              rules={[{ required: true }]}
            >
              <Input.TextArea rows={4} />
            </Form.Item>

            <Form.Item
              label="Content (Arabic)"
              name={['content', 'ar']}
              rules={[{ required: true }]}
            >
              <Input.TextArea rows={4} />
            </Form.Item>

            <Form.Item
              label="Content (CBK)"
              name={['content', 'cbk']}
              rules={[{ required: true }]}
            >
              <Input.TextArea rows={4} />
            </Form.Item>
          </div>

          <Form.Item
            label="Thumbnail URL"
            name="thumbnail_url"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Premium Article"
            name="is_premium"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            label="Importance Rating"
            name="importance_rating"
            rules={[{ required: true }]}
          >
            <InputNumber min={1} max={10} />
          </Form.Item>

          <Form.Item className="mb-0 text-right">
            <Button onClick={handleModalClose} className="mr-2">
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={createMutation.isLoading || updateMutation.isLoading}
            >
              {editingArticle ? 'Update' : 'Create'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
} 