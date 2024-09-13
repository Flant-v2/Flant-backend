  @OneToMany(() => Form, (form) => form.manager)
  form: Form[];

  @OneToOne(() => CommunityUser, (communityUser) => communityUser.manager)
  @JoinColumn({name: 'community_user_id'})
  communityUser: CommunityUser;

  @ManyToOne(() => Community, (community) => community.manager)
  @JoinColumn({name: 'community_id'})
  community: Community;

  @OneToMany(() => Notice, (notice) => notice.manager)
  notice: Notice[];
}
