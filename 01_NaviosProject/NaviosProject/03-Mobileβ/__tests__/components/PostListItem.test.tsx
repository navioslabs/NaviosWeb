import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import PostListItem from '../../components/PostListItem';
import type { Post } from '../../types';

const mockPost: Post = {
  id: 'post-1',
  category: 'stock',
  title: '新鮮な野菜が入荷しました',
  content: '朝採れ野菜です',
  author: {
    id: 'user-1',
    displayName: '田中太郎',
    avatar: '田',
    verified: true,
  },
  place: {
    name: '地元スーパー',
    address: '東京都',
    latitude: 35.6,
    longitude: 139.7,
  },
  distance: 350,
  images: [],
  allowComments: true,
  isEnded: false,
  commentCount: 5,
  createdAt: '10分前',
};

describe('PostListItem', () => {
  it('renders post title', () => {
    const { getByText } = render(
      <PostListItem post={mockPost} onPress={() => {}} />,
    );
    expect(getByText('新鮮な野菜が入荷しました')).toBeTruthy();
  });

  it('renders author name', () => {
    const { getByText } = render(
      <PostListItem post={mockPost} onPress={() => {}} />,
    );
    expect(getByText('田中太郎')).toBeTruthy();
  });

  it('renders formatted distance', () => {
    const { getByText } = render(
      <PostListItem post={mockPost} onPress={() => {}} />,
    );
    expect(getByText('350m')).toBeTruthy();
  });

  it('renders createdAt', () => {
    const { getByText } = render(
      <PostListItem post={mockPost} onPress={() => {}} />,
    );
    expect(getByText('10分前')).toBeTruthy();
  });

  it('calls onPress with post when tapped', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <PostListItem post={mockPost} onPress={onPress} />,
    );
    fireEvent.press(getByText('新鮮な野菜が入荷しました'));
    expect(onPress).toHaveBeenCalledWith(mockPost);
  });

  it('shows ended badge when post is ended', () => {
    const endedPost = { ...mockPost, isEnded: true };
    const { getByText } = render(
      <PostListItem post={endedPost} onPress={() => {}} />,
    );
    expect(getByText('終了')).toBeTruthy();
  });

  it('shows expiry label for stock posts', () => {
    const { getByText } = render(
      <PostListItem post={mockPost} onPress={() => {}} />,
    );
    expect(getByText('残り48時間')).toBeTruthy();
  });
});
