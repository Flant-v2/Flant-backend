  @OneToMany(() => Comment, (comment) => comment.artist)
  comments: Comment[]; // 아티스트와 댓글 관계

  @OneToOne(() => CommunityUser, (communityuser) => communityuser.artist)
  @JoinColumn({ name: 'community_user_id' })
  communityUser: CommunityUser; // 아티스트와 댓글 관계

  @ManyToOne(() => Community, (community) => community.artist)
  @JoinColumn({ name: 'community_id' })
  community: Community;

  @OneToMany(() => Post, (post) => post.artist)
  posts: Post[];

  @OneToMany(() => Live, (live) => live.artist)
  live: Live[];
}
