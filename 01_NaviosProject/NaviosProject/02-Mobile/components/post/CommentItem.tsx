import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Comment } from '../../types';
import UserAvatar from '../common/UserAvatar';
import { Colors } from '../../constants/colors';

type Props = {
  comment: Comment;
};

export default function CommentItem({ comment }: Props) {
  return (
    <View style={styles.container}>
      <UserAvatar avatar={comment.author.avatar} size={32} />
      <View style={styles.bubble}>
        <View style={styles.header}>
          <Text style={styles.name}>{comment.author.displayName}</Text>
          {comment.canHelp ? (
            <View style={styles.helpBadge}>
              <Text style={styles.helpText}>協力できます</Text>
            </View>
          ) : null}
          <Text style={styles.time}>{comment.createdAt}</Text>
        </View>
        <Text style={styles.content}>{comment.content}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
  },
  bubble: {
    flex: 1,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  name: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  helpBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  helpText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  time: {
    fontSize: 11,
    color: Colors.textMuted,
    marginLeft: 'auto',
  },
  content: {
    fontSize: 13,
    color: Colors.textPrimary,
    lineHeight: 18,
  },
});
